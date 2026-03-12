import React from 'react'
import { useEditorStore } from '@/store'
import { ZoomIn, ZoomOut, Undo2, Redo2, Eye, EyeOff, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react'
import { findParent } from '@/utils/tree-ops'

export default function CanvasToolbar() {
  const zoom = useEditorStore(s => s.zoom)
  const setZoom = useEditorStore(s => s.setZoom)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const previewMode = useEditorStore(s => s.previewMode)
  const togglePreviewMode = useEditorStore(s => s.togglePreviewMode)
  const past = useEditorStore(s => s.history.past)
  const future = useEditorStore(s => s.history.future)
  const selectedId = useEditorStore(s => s.selectedId)
  const tree = useEditorStore(s => s.tree)
  const moveNodeUp = useEditorStore(s => s.moveNodeUp)
  const moveNodeDown = useEditorStore(s => s.moveNodeDown)

  // Work out whether up/down are possible for the selected node
  const canMove = selectedId !== null
  const parent = selectedId ? findParent(tree, selectedId) : null
  const siblings = parent ? parent.children : tree
  const selectedIndex = selectedId ? siblings.findIndex(n => n.id === selectedId) : -1
  const canMoveUp = canMove && selectedIndex > 0
  const canMoveDown = canMove && selectedIndex >= 0 && selectedIndex < siblings.length - 1

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-editor-panel border-b border-editor-border">
      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={past.length === 0}
        className="p-1 rounded hover:bg-editor-hover disabled:opacity-30 text-editor-text"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={redo}
        disabled={future.length === 0}
        className="p-1 rounded hover:bg-editor-hover disabled:opacity-30 text-editor-text"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={14} />
      </button>

      <div className="w-px h-4 bg-editor-border mx-1" />

      {/* Layer order */}
      <button
        onClick={() => selectedId && moveNodeUp(selectedId)}
        disabled={!canMoveUp}
        className="p-1 rounded hover:bg-editor-hover disabled:opacity-30 text-editor-text"
        title="Move layer up"
      >
        <ArrowUp size={14} />
      </button>
      <button
        onClick={() => selectedId && moveNodeDown(selectedId)}
        disabled={!canMoveDown}
        className="p-1 rounded hover:bg-editor-hover disabled:opacity-30 text-editor-text"
        title="Move layer down"
      >
        <ArrowDown size={14} />
      </button>

      <div className="w-px h-4 bg-editor-border mx-1" />

      {/* Zoom */}
      <button
        onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
        className="p-1 rounded hover:bg-editor-hover text-editor-text"
        title="Zoom Out"
      >
        <ZoomOut size={14} />
      </button>
      <span className="text-xs text-editor-muted w-10 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom(Math.min(4, zoom + 0.25))}
        className="p-1 rounded hover:bg-editor-hover text-editor-text"
        title="Zoom In"
      >
        <ZoomIn size={14} />
      </button>
      <button
        onClick={() => setZoom(1)}
        className="p-1 rounded hover:bg-editor-hover text-editor-text text-xs px-2"
        title="Reset Zoom"
      >
        <RotateCcw size={12} />
      </button>

      <div className="flex-1" />

      {/* Preview toggle */}
      <button
        onClick={togglePreviewMode}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
          previewMode
            ? 'bg-editor-accent text-white'
            : 'hover:bg-editor-hover text-editor-text'
        }`}
        title="Toggle Preview Mode"
      >
        {previewMode ? <Eye size={12} /> : <EyeOff size={12} />}
        {previewMode ? 'Preview' : 'Edit'}
      </button>
    </div>
  )
}
