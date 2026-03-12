import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditorStore } from '@/store'
import type { ComponentNode } from '@/types/component-node'
import { ChevronRight, Eye, EyeOff, Lock, GripVertical, LayoutTemplate } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROOT_FRAME_ID } from '@/store/slices/tree.slice'

interface Props {
  node: ComponentNode
  depth: number
}

export default function TreeNode({ node, depth }: Props) {
  const [expanded, setExpanded] = useState(true)
  const selectedId = useEditorStore(s => s.selectedId)
  const selectNode = useEditorStore(s => s.selectNode)
  const setNodeVisible = useEditorStore(s => s.setNodeVisible)
  const isSelected = selectedId === node.id
  const hasChildren = node.children.length > 0
  const isRoot = node.id === ROOT_FRAME_ID

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, data: { kind: 'tree', nodeId: node.id } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      <div
        className={cn(
          'flex items-center gap-0.5 py-0.5 pr-1 rounded group cursor-pointer select-none',
          'hover:bg-editor-hover',
          isSelected && 'bg-editor-highlight text-white',
          !node.visible && 'opacity-50'
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => selectNode(node.id)}
      >
        {/* Drag handle — hidden for root frame */}
        {isRoot ? (
          <span className="text-editor-muted w-3 flex-shrink-0 flex items-center justify-center">
            <LayoutTemplate size={10} />
          </span>
        ) : (
          <span
            {...listeners}
            {...attributes}
            className="opacity-0 group-hover:opacity-100 cursor-grab text-editor-muted"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical size={10} />
          </span>
        )}

        {/* Expand toggle */}
        <span
          className={cn(
            'w-3 flex-shrink-0 flex items-center justify-center text-editor-muted',
            !hasChildren && 'opacity-0'
          )}
          onClick={e => {
            e.stopPropagation()
            setExpanded(v => !v)
          }}
        >
          <ChevronRight
            size={10}
            className={cn('transition-transform', expanded && 'rotate-90')}
          />
        </span>

        {/* Label */}
        <span className="flex-1 text-xs truncate">
          {node.label || node.type}
        </span>

        {/* Actions — root frame is not hideable */}
        {!isRoot && (
          <button
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white text-editor-muted"
            onClick={e => { e.stopPropagation(); setNodeVisible(node.id, !node.visible) }}
            title={node.visible ? 'Hide' : 'Show'}
          >
            {node.visible ? <Eye size={10} /> : <EyeOff size={10} />}
          </button>
        )}
        {node.locked && <Lock size={10} className="text-editor-muted flex-shrink-0" />}
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
