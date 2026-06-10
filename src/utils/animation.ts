import type { EasingType, Caption, CaptionKeyframe } from '@/types';

export const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t) => Math.sqrt(1 - --t * t),
  easeInOutCirc: (t) => {
    if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    return (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1) / 2;
  },
  easeInBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  easeInBounce: (t) => 1 - easingFunctions.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t) =>
    t < 0.5
      ? (1 - easingFunctions.easeOutBounce(1 - 2 * t)) / 2
      : (1 + easingFunctions.easeOutBounce(2 * t - 1)) / 2,
};

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

export function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  return rgbToHex(lerp(c1.r, c2.r, t), lerp(c1.g, c2.g, t), lerp(c1.b, c2.b, t));
}

export function getFramesTotalDuration(frames: { delay: number }[]): number {
  return frames.reduce((sum, f) => sum + f.delay, 0);
}

export function getFrameIndexAtTime(
  frames: { delay: number }[],
  time: number
): number {
  if (frames.length === 0) return 0;
  const total = getFramesTotalDuration(frames);
  let t = ((time % total) + total) % total;
  for (let i = 0; i < frames.length; i++) {
    if (t < frames[i].delay) return i;
    t -= frames[i].delay;
  }
  return frames.length - 1;
}

export function getTimeAtFrameIndex(
  frames: { delay: number }[],
  index: number
): number {
  let time = 0;
  for (let i = 0; i < Math.min(index, frames.length); i++) {
    time += frames[i].delay;
  }
  return time;
}

export function getKeyframesSorted(
  keyframes: CaptionKeyframe[]
): CaptionKeyframe[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

export interface CaptionRenderState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  skewX: number;
  skewY: number;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
}

export function getCaptionStateAtTime(
  caption: Caption,
  time: number
): CaptionRenderState | null {
  if (time < caption.startTime || time > caption.endTime) {
    return null;
  }

  const baseState: CaptionRenderState = {
    x: caption.x,
    y: caption.y,
    scaleX: caption.scaleX,
    scaleY: caption.scaleY,
    rotation: caption.rotation,
    opacity: caption.opacity,
    skewX: caption.skewX,
    skewY: caption.skewY,
    fontSize: caption.fontSize,
    color: caption.color,
    strokeColor: caption.strokeColor,
    strokeWidth: caption.strokeWidth,
  };

  const keyframes = getKeyframesSorted(caption.keyframes);
  if (keyframes.length === 0) {
    return baseState;
  }

  if (time <= keyframes[0].time) {
    return { ...baseState, ...getDefinedKeyframeValues(keyframes[0], baseState) };
  }

  if (time >= keyframes[keyframes.length - 1].time) {
    return {
      ...baseState,
      ...getDefinedKeyframeValues(keyframes[keyframes.length - 1], baseState),
    };
  }

  let prevKf = keyframes[0];
  let nextKf = keyframes[keyframes.length - 1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
      prevKf = keyframes[i];
      nextKf = keyframes[i + 1];
      break;
    }
  }

  const duration = nextKf.time - prevKf.time;
  const rawT = duration > 0 ? (time - prevKf.time) / duration : 0;
  const easing = nextKf.easing || caption.defaultEasing;
  const t = easingFunctions[easing](rawT);

  const prevState = { ...baseState, ...getDefinedKeyframeValues(prevKf, baseState) };
  const nextState = { ...baseState, ...getDefinedKeyframeValues(nextKf, baseState) };

  return interpolateStates(prevState, nextState, t);
}

function getDefinedKeyframeValues(
  kf: CaptionKeyframe,
  _base: CaptionRenderState
): Partial<CaptionRenderState> {
  const result: Partial<CaptionRenderState> = {};
  if (kf.x !== undefined) result.x = kf.x;
  if (kf.y !== undefined) result.y = kf.y;
  if (kf.scaleX !== undefined) result.scaleX = kf.scaleX;
  if (kf.scaleY !== undefined) result.scaleY = kf.scaleY;
  if (kf.rotation !== undefined) result.rotation = kf.rotation;
  if (kf.opacity !== undefined) result.opacity = kf.opacity;
  if (kf.skewX !== undefined) result.skewX = kf.skewX;
  if (kf.skewY !== undefined) result.skewY = kf.skewY;
  if (kf.fontSize !== undefined) result.fontSize = kf.fontSize;
  if (kf.color !== undefined) result.color = kf.color;
  if (kf.strokeColor !== undefined) result.strokeColor = kf.strokeColor;
  if (kf.strokeWidth !== undefined) result.strokeWidth = kf.strokeWidth;
  return result;
}

function interpolateStates(
  a: CaptionRenderState,
  b: CaptionRenderState,
  t: number
): CaptionRenderState {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    scaleX: lerp(a.scaleX, b.scaleX, t),
    scaleY: lerp(a.scaleY, b.scaleY, t),
    rotation: lerp(a.rotation, b.rotation, t),
    opacity: lerp(a.opacity, b.opacity, t),
    skewX: lerp(a.skewX, b.skewX, t),
    skewY: lerp(a.skewY, b.skewY, t),
    fontSize: lerp(a.fontSize, b.fontSize, t),
    color: lerpColor(a.color, b.color, t),
    strokeColor: lerpColor(a.strokeColor, b.strokeColor, t),
    strokeWidth: lerp(a.strokeWidth, b.strokeWidth, t),
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export const EASING_LABELS: Record<EasingType, string> = {
  linear: '线性',
  easeInQuad: '缓入 二次',
  easeOutQuad: '缓出 二次',
  easeInOutQuad: '缓入缓出 二次',
  easeInCubic: '缓入 三次',
  easeOutCubic: '缓出 三次',
  easeInOutCubic: '缓入缓出 三次',
  easeInQuart: '缓入 四次',
  easeOutQuart: '缓出 四次',
  easeInOutQuart: '缓入缓出 四次',
  easeInQuint: '缓入 五次',
  easeOutQuint: '缓出 五次',
  easeInOutQuint: '缓入缓出 五次',
  easeInSine: '缓入 正弦',
  easeOutSine: '缓出 正弦',
  easeInOutSine: '缓入缓出 正弦',
  easeInExpo: '缓入 指数',
  easeOutExpo: '缓出 指数',
  easeInOutExpo: '缓入缓出 指数',
  easeInCirc: '缓入 圆形',
  easeOutCirc: '缓出 圆形',
  easeInOutCirc: '缓入缓出 圆形',
  easeInBack: '缓入 回弹',
  easeOutBack: '缓出 回弹',
  easeInOutBack: '缓入缓出 回弹',
  easeInElastic: '缓入 弹性',
  easeOutElastic: '缓出 弹性',
  easeInOutElastic: '缓入缓出 弹性',
  easeInBounce: '缓入 弹跳',
  easeOutBounce: '缓出 弹跳',
  easeInOutBounce: '缓入缓出 弹跳',
};
