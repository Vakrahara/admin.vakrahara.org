'use client';

import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  GripVertical, 
  Video, 
  Layers, 
  Sparkles, 
  Landmark, 
  Brain, 
  FileText 
} from 'lucide-react';
import { StepSlotKey, STEP_SLOT_METAS } from '@/types/curriculum';

interface StepSlotOrderListProps {
  activeSlotsInOrder: StepSlotKey[];
  disabled?: boolean;
  onReorder: (newOrder: StepSlotKey[]) => void;
}

const SLOT_ICONS: Record<StepSlotKey, React.ElementType> = {
  video: Video,
  simulation: Layers,
  saraswati: Sparkles,
  gurutatva: Landmark,
  anveshana: Brain,
  explorableText: FileText
};

export function StepSlotOrderList({
  activeSlotsInOrder,
  disabled = false,
  onReorder
}: StepSlotOrderListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (activeSlotsInOrder.length === 0) return null;

  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    if (disabled) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeSlotsInOrder.length) return;

    const newOrder = [...activeSlotsInOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onReorder(newOrder);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex || disabled) return;
    const newOrder = [...activeSlotsInOrder];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, moved);
    setDraggedIndex(null);
    onReorder(newOrder);
  };

  return (
    <div className="space-y-2 pt-2 border-t border-slate-800/60">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Visual Execution Order (Drag / Up-Down)
        </label>
        <span className="text-[10px] text-amber-400/80 font-mono">
          Higher position renders first
        </span>
      </div>

      <div className="space-y-1.5">
        {activeSlotsInOrder.map((key, index) => {
          const meta = STEP_SLOT_METAS[key];
          const IconComponent = SLOT_ICONS[key];

          return (
            <div
              key={key}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                draggedIndex === index
                  ? 'border-amber-400 bg-amber-500/20 opacity-50'
                  : 'border-slate-800 bg-[#03050B] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-400/90 w-4">
                  #{index + 1}
                </span>
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <IconComponent className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-white truncate">
                  {meta.label.replace('Attach ', '')}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono text-slate-400 bg-slate-800/80">
                  {meta.badge}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => handleMoveSlot(index, 'up')}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-20 cursor-pointer transition-colors"
                  title="Move Slot Up"
                  aria-label={`Move ${meta.label.replace('Attach ', '')} Up`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={disabled || index === activeSlotsInOrder.length - 1}
                  onClick={() => handleMoveSlot(index, 'down')}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-20 cursor-pointer transition-colors"
                  title="Move Slot Down"
                  aria-label={`Move ${meta.label.replace('Attach ', '')} Down`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
