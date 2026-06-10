import type { Frame, Caption, CropConfig } from '@/types';
import { cloneImageData, cropImageData, resizeImageData } from './imageUtils';
import {
  getCaptionStateAtTime,
  getTimeAtFrameIndex,
  type CaptionRenderState,
} from './animation';

export function renderCaptionWithTransform(
  ctx: CanvasRenderingContext2D,
  caption: Caption,
  state: CaptionRenderState
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity));
  ctx.font = `${state.fontSize}px ${caption.fontFamily}`;
  ctx.textAlign = caption.align;
  ctx.textBaseline = 'top';

  ctx.translate(state.x, state.y);
  ctx.rotate((state.rotation * Math.PI) / 180);
  ctx.scale(state.scaleX, state.scaleY);
  ctx.transform(1, Math.tan((state.skewY * Math.PI) / 180), Math.tan((state.skewX * Math.PI) / 180), 1, 0, 0);

  if (state.strokeWidth > 0) {
    ctx.strokeStyle = state.strokeColor;
    ctx.lineWidth = state.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(caption.text, 0, 0);
  }

  ctx.fillStyle = state.color;
  ctx.fillText(caption.text, 0, 0);

  ctx.restore();
}

export function renderCaptionOnImageData(
  imageData: ImageData,
  captions: Caption[],
  frameIndex: number,
  frames?: Frame[]
): ImageData {
  const time = frames ? getTimeAtFrameIndex(frames, frameIndex) + frames[frameIndex]?.delay / 2 : 0;

  const relevantCaptions = captions.filter((c) => {
    const inFrameRange = frameIndex >= c.frameRange[0] && frameIndex <= c.frameRange[1];
    const inTimeRange = time >= c.startTime && time <= c.endTime;
    return inFrameRange || inTimeRange;
  });

  if (relevantCaptions.length === 0) return imageData;

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;

  ctx.putImageData(imageData, 0, 0);

  for (const caption of relevantCaptions) {
    const state = getCaptionStateAtTime(caption, time);
    if (!state) continue;
    renderCaptionWithTransform(ctx, caption, state);
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function renderCaptionOnImageDataAtTime(
  imageData: ImageData,
  captions: Caption[],
  time: number,
  frameIndex: number
): ImageData {
  const relevantCaptions = captions.filter((c) => {
    const inFrameRange = frameIndex >= c.frameRange[0] && frameIndex <= c.frameRange[1];
    const inTimeRange = time >= c.startTime && time <= c.endTime;
    return inFrameRange || inTimeRange;
  });

  if (relevantCaptions.length === 0) return imageData;

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;

  ctx.putImageData(imageData, 0, 0);

  for (const caption of relevantCaptions) {
    const state = getCaptionStateAtTime(caption, time);
    if (!state) continue;
    renderCaptionWithTransform(ctx, caption, state);
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function processFrame(
  frame: Frame,
  captions: Caption[],
  frameIndex: number,
  crop: CropConfig,
  exportWidth?: number,
  exportHeight?: number,
  frames?: Frame[]
): ImageData {
  let result = cloneImageData(frame.imageData);

  result = renderCaptionOnImageData(result, captions, frameIndex, frames);

  if (crop.enabled && crop.width > 0 && crop.height > 0) {
    result = cropImageData(result, crop.x, crop.y, crop.width, crop.height);
  }

  if (exportWidth && exportHeight && (result.width !== exportWidth || result.height !== exportHeight)) {
    result = resizeImageData(result, exportWidth, exportHeight);
  }

  return result;
}

export function processFrameAtTime(
  frame: Frame,
  captions: Caption[],
  time: number,
  frameIndex: number,
  crop: CropConfig,
  exportWidth?: number,
  exportHeight?: number
): ImageData {
  let result = cloneImageData(frame.imageData);

  result = renderCaptionOnImageDataAtTime(result, captions, time, frameIndex);

  if (crop.enabled && crop.width > 0 && crop.height > 0) {
    result = cropImageData(result, crop.x, crop.y, crop.width, crop.height);
  }

  if (exportWidth && exportHeight && (result.width !== exportWidth || result.height !== exportHeight)) {
    result = resizeImageData(result, exportWidth, exportHeight);
  }

  return result;
}

export function processAllFrames(
  frames: Frame[],
  captions: Caption[],
  crop: CropConfig,
  exportWidth?: number,
  exportHeight?: number
): { imageData: ImageData; delay: number }[] {
  return frames.map((frame, index) => ({
    imageData: processFrame(frame, captions, index, crop, exportWidth, exportHeight, frames),
    delay: frame.delay,
  }));
}
