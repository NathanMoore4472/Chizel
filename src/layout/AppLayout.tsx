import React, { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useEditorStore } from '@/store'
import { generateId } from '@/utils/id'
import { getComponent } from '@/registry'
import Canvas from '@/canvas/Canvas'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import ResizeHandle from './ResizeHandle'
import type { ComponentNode } from '@/types/component-node'

export default function AppLayout() {
  const [leftWidth, setLeftWidth] = useState(220)
  const [rightWidth, setRightWidth] = useState(260)
  const addNode = useEditorStore(s => s.addNode)
  const moveNode = useEditorStore(s => s.moveNode)
  const setDraggingId = useEditorStore(s => s.setDraggingId)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { data } = event.active
    if (data.current?.kind === 'tree') {
      setDraggingId(data.current.nodeId)
    }
  }, [setDraggingId])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDraggingId(null)
    const { active, over, delta } = event
    const activeData = active.data.current

    // Palette → Canvas
    // Don't require over.id === 'canvas-root' — over can be null if the droppable
    // didn't get hit, but we still want to place the node wherever the pointer landed.
    if (activeData?.kind === 'palette') {
      // Only ignore drops that land on the tree panel
      if (over?.data.current?.kind === 'tree') return

      const def = getComponent(activeData.type)
      if (!def) return

      // activatorEvent = mousedown position; delta = total movement since then.
      // Together they give us the actual pointer position at drop time.
      const activatorEvent = event.activatorEvent as MouseEvent
      const dropClientX = activatorEvent.clientX + delta.x
      const dropClientY = activatorEvent.clientY + delta.y

      // Convert from client coords to canvas-relative coords
      const canvasEl = document.getElementById('canvas-scroll-container')
      const canvasRect = canvasEl?.getBoundingClientRect()
      const scrollLeft = canvasEl?.scrollLeft ?? 0
      const scrollTop = canvasEl?.scrollTop ?? 0

      const x = Math.max(0, dropClientX - (canvasRect?.left ?? 0) + scrollLeft)
      const y = Math.max(0, dropClientY - (canvasRect?.top ?? 0) + scrollTop)

      const newNode: ComponentNode = {
        id: generateId(),
        type: activeData.type,
        props: { ...def.defaultProps },
        bindings: {},
        children: [],
        parentId: null,
        locked: false,
        visible: true,
        style: { x, y },
      }
      addNode(newNode, null)
      return
    }

    // Tree → Tree reorder
    if (active.data.current?.kind === 'tree' && over?.data.current?.kind === 'tree') {
      moveNode(active.data.current.nodeId, null, 0)
    }
  }, [addNode, moveNode, setDraggingId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-screen overflow-hidden bg-editor-bg">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-editor-panel border-b border-editor-border flex items-center px-3 z-50">
          <span className="text-xs font-bold text-editor-text tracking-wider">
            ◈ CHIZEL
          </span>
          <span className="text-xs text-editor-muted ml-2">Visual Editor</span>
        </div>

        {/* Main layout below header */}
        <div className="flex flex-1 pt-8 overflow-hidden">
          {/* Left sidebar */}
          <div style={{ width: leftWidth }} className="flex-shrink-0 overflow-hidden">
            <LeftSidebar />
          </div>

          <ResizeHandle
            onResize={delta => setLeftWidth(w => Math.max(160, Math.min(400, w + delta)))}
          />

          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>

          <ResizeHandle
            onResize={delta => setRightWidth(w => Math.max(200, Math.min(500, w - delta)))}
          />

          {/* Right sidebar */}
          <div style={{ width: rightWidth }} className="flex-shrink-0 overflow-hidden">
            <RightSidebar />
          </div>
        </div>
      </div>
      <DragOverlay>
        {/* Placeholder shown while dragging */}
        <div className="bg-editor-panel border border-editor-accent rounded px-2 py-1 text-xs text-editor-text opacity-80">
          Dragging...
        </div>
      </DragOverlay>
    </DndContext>
  )
}
