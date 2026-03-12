import React, { useState, useCallback } from 'react'
import ComponentPalette from '@/panels/palette/ComponentPalette'
import ComponentTree from '@/panels/tree/ComponentTree'
import ResizeHandle from './ResizeHandle'

export default function LeftSidebar() {
  const [paletteHeight, setPaletteHeight] = useState(300)

  const onResize = useCallback((delta: number) => {
    setPaletteHeight(h => Math.max(150, Math.min(600, h + delta)))
  }, [])

  return (
    <div className="flex flex-col h-full bg-editor-panel border-r border-editor-border overflow-hidden">
      {/* Palette */}
      <div style={{ height: paletteHeight }} className="flex-shrink-0 overflow-hidden flex flex-col">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-editor-border flex-shrink-0">
          <span className="text-xs font-semibold text-editor-muted uppercase tracking-wider">Components</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ComponentPalette />
        </div>
      </div>

      <ResizeHandle direction="vertical" onResize={onResize} />

      {/* Tree */}
      <div className="flex-1 overflow-hidden">
        <ComponentTree />
      </div>
    </div>
  )
}
