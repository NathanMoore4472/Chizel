import React, { useCallback } from 'react'
import { useEditorStore } from '@/store'
import { ROOT_FRAME_ID } from '@/store/slices/tree.slice'
import { findNode } from '@/utils/tree-ops'
import NodeRenderer from './NodeRenderer'
import CanvasToolbar from './CanvasToolbar'

export default function Canvas() {
  const tree = useEditorStore(s => s.tree)
  const zoom = useEditorStore(s => s.zoom)
  const selectNode = useEditorStore(s => s.selectNode)

  const rootFrame = findNode(tree, ROOT_FRAME_ID)

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) selectNode(null)
  }, [selectNode])

  return (
    <div className="flex flex-col h-full bg-editor-bg overflow-hidden">
      <CanvasToolbar />
      <div
        id="canvas-scroll-container"
        className="flex-1 overflow-auto"
        onClick={handleCanvasClick}
      >
        <div
          id="canvas-drop-root"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
            minHeight: `${100 / zoom * 100}%`,
          }}
        >
          {rootFrame ? (
            <NodeRenderer node={rootFrame} isRoot />
          ) : (
            <div className="flex items-center justify-center h-full text-editor-muted text-sm">
              No frame
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
