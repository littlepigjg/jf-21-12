import { useState } from 'react';
import {
  Type,
  Crop,
  Palette,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Clock,
  Move,
  Maximize2,
  RotateCw,
  Layers,
  Diamond,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import type { Caption, EasingType } from '@/types';
import { cn } from '@/lib/utils';
import { EASING_LABELS, getKeyframesSorted } from '@/utils/animation';

interface PanelSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function PanelSection({ title, icon, children, defaultOpen = true }: PanelSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-200">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function KeyframeEditor({ caption }: { caption: Caption }) {
  const { addKeyframe, updateKeyframe, deleteKeyframe, currentPlaybackTime, totalDuration } =
    useEditorStore();
  const [selectedKfId, setSelectedKfId] = useState<string | null>(null);

  const sortedKeyframes = getKeyframesSorted(caption.keyframes);
  const selectedKf = sortedKeyframes.find((k) => k.id === selectedKfId);

  const handleAddKeyframe = () => {
    addKeyframe(caption.id, {
      time: currentPlaybackTime,
      x: caption.x,
      y: caption.y,
      scaleX: caption.scaleX,
      scaleY: caption.scaleY,
      rotation: caption.rotation,
      opacity: caption.opacity,
      easing: caption.defaultEasing,
    });
  };

  const handleCaptureCurrent = () => {
    addKeyframe(caption.id, {
      time: currentPlaybackTime,
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
      easing: caption.defaultEasing,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleAddKeyframe}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded transition-colors"
        >
          <Diamond className="w-3 h-3" />
          添加空关键帧
        </button>
        <button
          onClick={handleCaptureCurrent}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          捕获当前状态
        </button>
      </div>

      {sortedKeyframes.length > 0 && (
        <div className="relative h-10 bg-slate-800 rounded border border-slate-700">
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center px-1">
            {sortedKeyframes.map((kf) => {
              const pos = totalDuration > 0 ? (kf.time / totalDuration) * 100 : 0;
              const isSelected = kf.id === selectedKfId;
              return (
                <button
                  key={kf.id}
                  onClick={() => setSelectedKfId(isSelected ? null : kf.id)}
                  className={cn(
                    'absolute w-4 h-4 -translate-x-1/2 rotate-45 transition-all',
                    isSelected
                      ? 'bg-violet-400 shadow-lg shadow-violet-500/50 scale-125'
                      : 'bg-cyan-500 hover:bg-cyan-400'
                  )}
                  style={{ left: `${pos}%` }}
                  title={`${kf.time.toFixed(0)}ms`}
                />
              );
            })}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-orange-500/80 -translate-x-1/2"
              style={{ left: `${totalDuration > 0 ? (currentPlaybackTime / totalDuration) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {sortedKeyframes.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-2">暂无关键帧</p>
      )}

      {selectedKf && (
        <div className="bg-slate-800/70 rounded-lg p-3 space-y-2 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-violet-300">关键帧属性</span>
            <button
              onClick={() => {
                deleteKeyframe(caption.id, selectedKf.id);
                setSelectedKfId(null);
              }}
              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-orange-400 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">时间 (ms)</label>
            <input
              type="number"
              value={selectedKf.time}
              onChange={(e) =>
                updateKeyframe(caption.id, selectedKf.id, { time: Number(e.target.value) })
              }
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">缓动函数</label>
            <select
              value={selectedKf.easing || caption.defaultEasing}
              onChange={(e) =>
                updateKeyframe(caption.id, selectedKf.id, {
                  easing: e.target.value as EasingType,
                })
              }
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {Object.entries(EASING_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">X</label>
              <input
                type="number"
                value={selectedKf.x ?? ''}
                placeholder={caption.x.toString()}
                onChange={(e) =>
                  updateKeyframe(caption.id, selectedKf.id, {
                    x: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Y</label>
              <input
                type="number"
                value={selectedKf.y ?? ''}
                placeholder={caption.y.toString()}
                onChange={(e) =>
                  updateKeyframe(caption.id, selectedKf.id, {
                    y: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">缩放 X</label>
              <input
                type="number"
                step="0.1"
                value={selectedKf.scaleX ?? ''}
                placeholder={caption.scaleX.toString()}
                onChange={(e) =>
                  updateKeyframe(caption.id, selectedKf.id, {
                    scaleX: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">缩放 Y</label>
              <input
                type="number"
                step="0.1"
                value={selectedKf.scaleY ?? ''}
                placeholder={caption.scaleY.toString()}
                onChange={(e) =>
                  updateKeyframe(caption.id, selectedKf.id, {
                    scaleY: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">旋转°</label>
              <input
                type="number"
                value={selectedKf.rotation ?? ''}
                placeholder={caption.rotation.toString()}
                onChange={(e) =>
                  updateKeyframe(caption.id, selectedKf.id, {
                    rotation: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">透明度</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={selectedKf.opacity ?? ''}
                placeholder={caption.opacity.toString()}
                onChange={(e) =>
                  updateKeyframe(caption.id, selectedKf.id, {
                    opacity: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">字体大小</label>
            <input
              type="number"
              value={selectedKf.fontSize ?? ''}
              placeholder={caption.fontSize.toString()}
              onChange={(e) =>
                updateKeyframe(caption.id, selectedKf.id, {
                  fontSize: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CaptionEditor({ caption }: { caption: Caption }) {
  const { updateCaption, deleteCaption, frames, totalDuration, setCurrentPlaybackTime, currentPlaybackTime } =
    useEditorStore();
  const maxFrame = Math.max(0, frames.length - 1);

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3 border border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">字幕内容</span>
        <button
          onClick={() => deleteCaption(caption.id)}
          className="p-1 hover:bg-slate-700 text-slate-400 hover:text-orange-400 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <input
        type="text"
        value={caption.text}
        onChange={(e) => updateCaption(caption.id, { text: e.target.value })}
        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
        placeholder="输入字幕内容"
      />

      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-slate-300">时间控制</span>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">起始 (ms)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={caption.startTime}
                  onChange={(e) =>
                    updateCaption(caption.id, {
                      startTime: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={() =>
                    updateCaption(caption.id, { startTime: currentPlaybackTime })
                  }
                  className="px-1.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                  title="使用当前播放时间"
                >
                  ⏱
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">结束 (ms)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={caption.endTime}
                  onChange={(e) =>
                    updateCaption(caption.id, {
                      endTime: Math.min(totalDuration, Number(e.target.value)),
                    })
                  }
                  className="flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={() =>
                    updateCaption(caption.id, { endTime: currentPlaybackTime })
                  }
                  className="px-1.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                  title="使用当前播放时间"
                >
                  ⏱
                </button>
              </div>
            </div>
          </div>
          <div className="relative h-5 bg-slate-900 rounded border border-slate-700 cursor-pointer"
            onClick={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setCurrentPlaybackTime(ratio * totalDuration);
            }}
          >
            <div
              className="absolute top-0 bottom-0 bg-violet-600/40 rounded"
              style={{
                left: `${totalDuration > 0 ? (caption.startTime / totalDuration) * 100 : 0}%`,
                width: `${
                  totalDuration > 0
                    ? ((caption.endTime - caption.startTime) / totalDuration) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-orange-500 -translate-x-1/2"
              style={{ left: `${totalDuration > 0 ? (currentPlaybackTime / totalDuration) * 100 : 0}%` }}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              帧范围: {caption.frameRange[0] + 1} - {caption.frameRange[1] + 1}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={maxFrame}
                value={caption.frameRange[0]}
                onChange={(e) =>
                  updateCaption(caption.id, {
                    frameRange: [Number(e.target.value), Math.max(Number(e.target.value), caption.frameRange[1])],
                  })
                }
                className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
              <input
                type="range"
                min={0}
                max={maxFrame}
                value={caption.frameRange[1]}
                onChange={(e) =>
                  updateCaption(caption.id, {
                    frameRange: [Math.min(caption.frameRange[0], Number(e.target.value)), Number(e.target.value)],
                  })
                }
                className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Type className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-medium text-slate-300">基础样式</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">字体大小</label>
            <input
              type="number"
              value={caption.fontSize}
              onChange={(e) => updateCaption(caption.id, { fontSize: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              min={8}
              max={200}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">对齐</label>
            <select
              value={caption.align}
              onChange={(e) =>
                updateCaption(caption.id, { align: e.target.value as 'left' | 'center' | 'right' })
              }
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">文字颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={caption.color}
                onChange={(e) => updateCaption(caption.id, { color: e.target.value })}
                className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={caption.color}
                onChange={(e) => updateCaption(caption.id, { color: e.target.value })}
                className="flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">描边颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={caption.strokeColor}
                onChange={(e) => updateCaption(caption.id, { strokeColor: e.target.value })}
                className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={caption.strokeColor}
                onChange={(e) => updateCaption(caption.id, { strokeColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>
        </div>
        <div className="mt-2">
          <label className="text-xs text-slate-400 block mb-1">描边宽度: {caption.strokeWidth}px</label>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={caption.strokeWidth}
            onChange={(e) => updateCaption(caption.id, { strokeWidth: Number(e.target.value) })}
            className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Move className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-medium text-slate-300">位置</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">X 位置</label>
            <input
              type="number"
              value={caption.x}
              onChange={(e) => updateCaption(caption.id, { x: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Y 位置</label>
            <input
              type="number"
              value={caption.y}
              onChange={(e) => updateCaption(caption.id, { y: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">变换</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">缩放 X</label>
            <input
              type="number"
              step="0.05"
              value={caption.scaleX}
              onChange={(e) => updateCaption(caption.id, { scaleX: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">缩放 Y</label>
            <input
              type="number"
              step="0.05"
              value={caption.scaleY}
              onChange={(e) => updateCaption(caption.id, { scaleY: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">倾斜 X°</label>
            <input
              type="number"
              step="1"
              value={caption.skewX}
              onChange={(e) => updateCaption(caption.id, { skewX: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">倾斜 Y°</label>
            <input
              type="number"
              step="1"
              value={caption.skewY}
              onChange={(e) => updateCaption(caption.id, { skewY: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <RotateCw className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs font-medium text-slate-300">旋转与透明度</span>
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">旋转角度</label>
              <span className="text-xs text-slate-300 font-mono">{caption.rotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={caption.rotation}
              onChange={(e) => updateCaption(caption.id, { rotation: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">透明度</label>
              <span className="text-xs text-slate-300 font-mono">{(caption.opacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={caption.opacity}
              onChange={(e) => updateCaption(caption.id, { opacity: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-slate-300">动画设置</span>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">默认缓动函数</label>
            <select
              value={caption.defaultEasing}
              onChange={(e) =>
                updateCaption(caption.id, { defaultEasing: e.target.value as EasingType })
              }
              className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {Object.entries(EASING_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Diamond className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-slate-300">关键帧动画</span>
        </div>
        <KeyframeEditor caption={caption} />
      </div>
    </div>
  );
}

export default function PropertyPanel() {
  const {
    captions,
    addCaption,
    crop,
    setCrop,
    exportConfig,
    setExportConfig,
    frames,
    canvasWidth,
    canvasHeight,
    setAllFrameDelays,
  } = useEditorStore();

  const [globalDelay, setGlobalDelay] = useState(100);

  return (
    <div className="w-80 bg-slate-900/50 border-l border-slate-700 flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">属性设置</h3>
      </div>

      <PanelSection
        title="全局帧时长"
        icon={<Clock className="w-4 h-4 text-cyan-400" />}
        defaultOpen={true}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">统一设置时长</label>
            <span className="text-xs text-slate-300 font-mono">{globalDelay}ms</span>
          </div>
          <input
            type="range"
            min="10"
            max="5000"
            step="10"
            value={globalDelay}
            onChange={(e) => setGlobalDelay(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
          />
          <button
            onClick={() => setAllFrameDelays(globalDelay)}
            disabled={frames.length === 0}
            className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            应用到所有帧
          </button>
        </div>
      </PanelSection>

      <PanelSection
        title="字幕"
        icon={<Type className="w-4 h-4 text-violet-400" />}
        defaultOpen={true}
      >
        <button
          onClick={() => addCaption()}
          disabled={frames.length === 0}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-lg text-sm font-medium transition-colors mb-2"
        >
          <Plus className="w-4 h-4" />
          添加字幕
        </button>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {captions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">暂无字幕</p>
          ) : (
            captions.map((caption) => (
              <CaptionEditor key={caption.id} caption={caption} />
            ))
          )}
        </div>
      </PanelSection>

      <PanelSection
        title="裁切"
        icon={<Crop className="w-4 h-4 text-orange-400" />}
        defaultOpen={false}
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={crop.enabled}
              onChange={(e) => setCrop({ enabled: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 text-violet-600 focus:ring-violet-500 bg-slate-900"
            />
            <span className="text-sm text-slate-300">启用裁切</span>
          </label>

          <div className={cn('space-y-2', !crop.enabled && 'opacity-50 pointer-events-none')}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">X 起点</label>
                <input
                  type="number"
                  value={crop.x}
                  onChange={(e) => setCrop({ x: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-violet-500"
                  min={0}
                  max={canvasWidth}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Y 起点</label>
                <input
                  type="number"
                  value={crop.y}
                  onChange={(e) => setCrop({ y: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-violet-500"
                  min={0}
                  max={canvasHeight}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">宽度</label>
                <input
                  type="number"
                  value={crop.width}
                  onChange={(e) => setCrop({ width: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-violet-500"
                  min={1}
                  max={canvasWidth}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">高度</label>
                <input
                  type="number"
                  value={crop.height}
                  onChange={(e) => setCrop({ height: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-violet-500"
                  min={1}
                  max={canvasHeight}
                />
              </div>
            </div>
            <button
              onClick={() =>
                setCrop({
                  x: 0,
                  y: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                })
              }
              className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition-colors"
            >
              重置为画布尺寸
            </button>
          </div>
        </div>
      </PanelSection>

      <PanelSection
        title="调色板优化"
        icon={<Palette className="w-4 h-4 text-emerald-400" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">颜色数量</label>
              <span className="text-xs text-slate-300 font-mono">{exportConfig.colors}</span>
            </div>
            <input
              type="range"
              min={2}
              max={256}
              step={1}
              value={exportConfig.colors}
              onChange={(e) => setExportConfig({ colors: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">颜色越少文件越小</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">质量</label>
              <span className="text-xs text-slate-300 font-mono">{exportConfig.quality}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={exportConfig.quality}
              onChange={(e) => setExportConfig({ quality: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportConfig.dither}
              onChange={(e) => setExportConfig({ dither: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
            />
            <span className="text-sm text-slate-300">启用抖动 (提升画质)</span>
          </label>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">输出帧率 (FPS)</label>
              <span className="text-xs text-slate-300 font-mono">{exportConfig.fps}</span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              step={1}
              value={exportConfig.fps}
              onChange={(e) => setExportConfig({ fps: Number(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">输出宽度</label>
              <input
                type="number"
                value={exportConfig.width || canvasWidth}
                onChange={(e) => setExportConfig({ width: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-violet-500"
                min={1}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">输出高度</label>
              <input
                type="number"
                value={exportConfig.height || canvasHeight}
                onChange={(e) => setExportConfig({ height: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-violet-500"
                min={1}
              />
            </div>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}
