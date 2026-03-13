import React, { useRef } from 'react'
import { useEditorStore } from '@/store'
import { useIsPreview } from './PreviewContext'
import type { ComponentNode } from '@/types/component-node'

interface Props {
  node: ComponentNode
  children: React.ReactNode
}

export default function SelectionOverlay({ node, children }: Props) {
  const selectedId = useEditorStore(s => s.selectedId)
  const selectNode = useEditorStore(s => s.selectNode)
  const storePreview = useEditorStore(s => s.previewMode)
  const ctxPreview = useIsPreview()
  const isSelected = selectedId === node.id

  if (storePreview || ctxPreview) {
    return <>{children}</>
  }

  return (
    <div
      className="relative"
      onClick={e => {
        e.stopPropagation()
        selectNode(node.id)
      }}
      style={{ cursor: node.locked ? 'not-allowed' : 'pointer' }}
    >
      {children}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            outline: '2px solid #0e639c',
            outlineOffset: '-2px',
          }}
        >
          {/* Top-left label */}
          <div
            className="absolute -top-5 left-0 bg-editor-accent text-white text-xs px-1 py-0.5 rounded-t whitespace-nowrap"
            style={{ fontSize: '10px', lineHeight: 1.2 }}
          >
            {node.label || node.type}
          </div>
          {/* Resize handle (visual only) */}
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-editor-accent pointer-events-auto cursor-se-resize" />
        </div>
      )}
      {!isSelected && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 hover:opacity-100"
          style={{ outline: '1px dashed #858585', outlineOffset: '-1px' }}
        />
      )}
    </div>
  )
}
