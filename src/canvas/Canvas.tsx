import React, { useCallback } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useEditorStore } from '@/store'
import NodeRenderer from './NodeRenderer'
import CanvasToolbar from './CanvasToolbar'
import { cn } from '@/utils/cn'

export default function Canvas() {
  const tree = useEditorStore(s => s.tree)
  const zoom = useEditorStore(s => s.zoom)
  const selectNode = useEditorStore(s => s.selectNode)
  const previewMode = useEditorStore(s => s.previewMode)

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-root' })

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectNode(null)
    }
  }, [selectNode])

  return (
    <div className="flex flex-col h-full bg-editor-bg overflow-hidden">
      <CanvasToolbar />
      {/* Scroll container — give it an explicit id so drag handler can read its rect */}
      <div
        id="canvas-scroll-container"
        className="flex-1 overflow-auto relative"
        onClick={handleCanvasClick}
      >
        {/* Droppable surface — must be tall enough to be hit-tested by dnd-kit */}
        <div
          ref={setNodeRef}
          id="canvas-drop-root"
          className={cn(
            'relative',
            isOver && !previewMode && 'bg-blue-950/20'
          )}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
            /* Guarantee a minimum canvas height so the droppable is always hittable */
            minHeight: `${100 / zoom * 100}%`,
          }}
          onClick={handleCanvasClick}
        >
          {tree.length === 0 && !previewMode && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-editor-muted">
                <div className="text-4xl mb-3 opacity-30">◻</div>
                <div className="text-sm font-medium">Drop components here</div>
                <div className="text-xs mt-1 opacity-60">Drag from the palette on the left</div>
              </div>
            </div>
          )}
          {tree.map(node => (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.style?.x ?? 20,
                top: node.style?.y ?? 20,
                width: node.style?.width,
                height: node.style?.height,
              }}
            >
              <NodeRenderer node={node} isRoot />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
