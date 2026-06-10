import { create } from 'zustand';
import type { Frame, Caption, CropConfig, ExportConfig, CaptionKeyframe } from '@/types';
import { generateId, cloneImageData, createBlankImageData } from '@/utils/imageUtils';
import {
  getFramesTotalDuration,
  getTimeAtFrameIndex,
  getFrameIndexAtTime,
} from '@/utils/animation';

interface EditorStore {
  frames: Frame[];
  selectedFrameIndex: number;
  captions: Caption[];
  crop: CropConfig;
  exportConfig: ExportConfig;
  isPlaying: boolean;
  playbackSpeed: number;
  currentFrameIndex: number;
  currentPlaybackTime: number;
  totalDuration: number;
  canvasWidth: number;
  canvasHeight: number;
  showImportDialog: boolean;
  showExportDialog: boolean;

  setFrames: (frames: Frame[]) => void;
  setSelectedFrameIndex: (index: number) => void;
  setCurrentFrameIndex: (index: number) => void;
  setCurrentPlaybackTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setShowImportDialog: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;

  addFrame: (imageData?: ImageData, afterIndex?: number) => void;
  deleteFrame: (index: number) => void;
  duplicateFrame: (index: number) => void;
  moveFrame: (fromIndex: number, toIndex: number) => void;
  setFrameDelay: (index: number, delay: number) => void;
  setAllFrameDelays: (delay: number) => void;

  addCaption: (caption?: Partial<Caption>) => void;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  deleteCaption: (id: string) => void;

  addKeyframe: (captionId: string, keyframe: Partial<CaptionKeyframe> & { time: number }) => void;
  updateKeyframe: (captionId: string, keyframeId: string, updates: Partial<CaptionKeyframe>) => void;
  deleteKeyframe: (captionId: string, keyframeId: string) => void;

  setCrop: (crop: Partial<CropConfig>) => void;
  setExportConfig: (config: Partial<ExportConfig>) => void;

  clearAll: () => void;
}

const defaultCrop: CropConfig = {
  enabled: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

const defaultExportConfig: ExportConfig = {
  colors: 256,
  quality: 80,
  fps: 15,
  dither: true,
  repeat: 0,
  width: 0,
  height: 0,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  frames: [],
  selectedFrameIndex: -1,
  captions: [],
  crop: defaultCrop,
  exportConfig: defaultExportConfig,
  isPlaying: false,
  playbackSpeed: 1,
  currentFrameIndex: 0,
  currentPlaybackTime: 0,
  totalDuration: 0,
  canvasWidth: 640,
  canvasHeight: 480,
  showImportDialog: false,
  showExportDialog: false,

  setFrames: (frames) => {
    if (frames.length > 0) {
      const firstFrame = frames[0];
      const exportCfg = get().exportConfig;
      const totalDuration = getFramesTotalDuration(frames);
      set({
        frames,
        selectedFrameIndex: 0,
        currentFrameIndex: 0,
        currentPlaybackTime: 0,
        totalDuration,
        canvasWidth: firstFrame.width,
        canvasHeight: firstFrame.height,
        crop: {
          ...get().crop,
          width: firstFrame.width,
          height: firstFrame.height,
        },
        exportConfig: {
          ...exportCfg,
          width: exportCfg.width || firstFrame.width,
          height: exportCfg.height || firstFrame.height,
        },
      });
    } else {
      set({ frames, selectedFrameIndex: -1, currentFrameIndex: 0, currentPlaybackTime: 0, totalDuration: 0 });
    }
  },

  setSelectedFrameIndex: (index) => set({ selectedFrameIndex: index }),

  setCurrentFrameIndex: (index) => {
    const state = get();
    const time = getTimeAtFrameIndex(state.frames, index);
    set({ currentFrameIndex: index, currentPlaybackTime: time });
  },

  setCurrentPlaybackTime: (time) => {
    const state = get();
    const total = state.totalDuration || 1;
    const clampedTime = Math.max(0, Math.min(time, total));
    const frameIndex = getFrameIndexAtTime(state.frames, clampedTime);
    set({ currentPlaybackTime: clampedTime, currentFrameIndex: frameIndex });
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setShowImportDialog: (show) => set({ showImportDialog: show }),
  setShowExportDialog: (show) => set({ showExportDialog: show }),

  addFrame: (imageData, afterIndex) => {
    const state = get();
    const width = state.canvasWidth;
    const height = state.canvasHeight;
    const newFrame: Frame = {
      id: generateId(),
      imageData: imageData || createBlankImageData(width, height),
      delay: 100,
      width,
      height,
      disposalMethod: 2,
    };

    const newFrames = [...state.frames];
    if (afterIndex !== undefined && afterIndex >= 0 && afterIndex < newFrames.length) {
      newFrames.splice(afterIndex + 1, 0, newFrame);
      set({ frames: newFrames, selectedFrameIndex: afterIndex + 1, totalDuration: getFramesTotalDuration(newFrames) });
    } else {
      newFrames.push(newFrame);
      set({ frames: newFrames, selectedFrameIndex: newFrames.length - 1, totalDuration: getFramesTotalDuration(newFrames) });
    }
  },

  deleteFrame: (index) => {
    const state = get();
    if (state.frames.length <= 1) {
      set({ frames: [], selectedFrameIndex: -1, currentFrameIndex: 0, currentPlaybackTime: 0, totalDuration: 0 });
      return;
    }
    const newFrames = state.frames.filter((_, i) => i !== index);
    const newSelected = index >= newFrames.length ? newFrames.length - 1 : index;
    set({
      frames: newFrames,
      selectedFrameIndex: newSelected,
      currentFrameIndex: Math.min(state.currentFrameIndex, newFrames.length - 1),
      totalDuration: getFramesTotalDuration(newFrames),
    });
  },

  duplicateFrame: (index) => {
    const state = get();
    const frame = state.frames[index];
    if (!frame) return;

    const newFrame: Frame = {
      ...frame,
      id: generateId(),
      imageData: cloneImageData(frame.imageData),
    };

    const newFrames = [...state.frames];
    newFrames.splice(index + 1, 0, newFrame);
    set({ frames: newFrames, selectedFrameIndex: index + 1, totalDuration: getFramesTotalDuration(newFrames) });
  },

  moveFrame: (fromIndex, toIndex) => {
    const state = get();
    if (fromIndex === toIndex) return;
    const newFrames = [...state.frames];
    const [removed] = newFrames.splice(fromIndex, 1);
    newFrames.splice(toIndex, 0, removed);
    set({ frames: newFrames, selectedFrameIndex: toIndex });
  },

  setFrameDelay: (index, delay) => {
    const state = get();
    const newFrames = [...state.frames];
    if (newFrames[index]) {
      newFrames[index] = { ...newFrames[index], delay: Math.max(10, delay) };
      set({ frames: newFrames, totalDuration: getFramesTotalDuration(newFrames) });
    }
  },

  setAllFrameDelays: (delay) => {
    const state = get();
    const newFrames = state.frames.map((f) => ({ ...f, delay: Math.max(10, delay) }));
    set({ frames: newFrames, totalDuration: getFramesTotalDuration(newFrames) });
  },

  addCaption: (caption) => {
    const state = get();
    const maxFrames = Math.max(0, state.frames.length - 1);
    const totalDuration = state.totalDuration;
    const newCaption: Caption = {
      id: generateId(),
      text: caption?.text || '新字幕',
      frameRange: caption?.frameRange || [0, maxFrames],
      startTime: caption?.startTime ?? 0,
      endTime: caption?.endTime ?? totalDuration,
      x: caption?.x ?? state.canvasWidth / 2,
      y: caption?.y ?? state.canvasHeight - 60,
      scaleX: caption?.scaleX ?? 1,
      scaleY: caption?.scaleY ?? 1,
      rotation: caption?.rotation ?? 0,
      opacity: caption?.opacity ?? 1,
      skewX: caption?.skewX ?? 0,
      skewY: caption?.skewY ?? 0,
      fontSize: caption?.fontSize || 32,
      fontFamily: caption?.fontFamily || 'Arial, sans-serif',
      color: caption?.color || '#FFFFFF',
      strokeColor: caption?.strokeColor || '#000000',
      strokeWidth: caption?.strokeWidth ?? 2,
      align: caption?.align || 'center',
      keyframes: caption?.keyframes || [],
      defaultEasing: caption?.defaultEasing || 'easeOutQuad',
    };
    set({ captions: [...state.captions, newCaption] });
  },

  updateCaption: (id, updates) => {
    const state = get();
    const newCaptions = state.captions.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    set({ captions: newCaptions });
  },

  deleteCaption: (id) => {
    const state = get();
    set({ captions: state.captions.filter((c) => c.id !== id) });
  },

  addKeyframe: (captionId, keyframe) => {
    const state = get();
    const newCaptions = state.captions.map((c) => {
      if (c.id !== captionId) return c;
      const newKf: CaptionKeyframe = {
        id: generateId(),
        time: keyframe.time,
        ...keyframe,
      };
      return { ...c, keyframes: [...c.keyframes, newKf] };
    });
    set({ captions: newCaptions });
  },

  updateKeyframe: (captionId, keyframeId, updates) => {
    const state = get();
    const newCaptions = state.captions.map((c) => {
      if (c.id !== captionId) return c;
      const newKeyframes = c.keyframes.map((kf) =>
        kf.id === keyframeId ? { ...kf, ...updates } : kf
      );
      return { ...c, keyframes: newKeyframes };
    });
    set({ captions: newCaptions });
  },

  deleteKeyframe: (captionId, keyframeId) => {
    const state = get();
    const newCaptions = state.captions.map((c) => {
      if (c.id !== captionId) return c;
      return { ...c, keyframes: c.keyframes.filter((kf) => kf.id !== keyframeId) };
    });
    set({ captions: newCaptions });
  },

  setCrop: (crop) => set({ crop: { ...get().crop, ...crop } }),
  setExportConfig: (config) => set({ exportConfig: { ...get().exportConfig, ...config } }),

  clearAll: () =>
    set({
      frames: [],
      selectedFrameIndex: -1,
      captions: [],
      crop: defaultCrop,
      isPlaying: false,
      currentFrameIndex: 0,
      currentPlaybackTime: 0,
      totalDuration: 0,
      showImportDialog: false,
      showExportDialog: false,
    }),
}));
