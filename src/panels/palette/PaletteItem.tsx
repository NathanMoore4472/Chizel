import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { ComponentDefinition } from '@/types'
import { cn } from '@/utils/cn'

interface Props {
  def: ComponentDefinition
}

export default function PaletteItem({ def }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${def.type}`,
    data: { kind: 'palette', type: def.type },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing',
        'text-xs text-editor-text hover:bg-editor-hover border border-transparent',
        'hover:border-editor-border transition-colors select-none',
        isDragging && 'opacity-50'
      )}
      title={def.description}
    >
      <span className="text-editor-muted text-[10px] font-mono w-3 text-center">⬡</span>
      <span className="font-medium">{def.label}</span>
    </div>
  )
}
