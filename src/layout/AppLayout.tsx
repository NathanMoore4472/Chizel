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
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Palette → Canvas
    if (activeData?.kind === 'palette' && over.id === 'canvas-root') {
      const def = getComponent(activeData.type)
      if (!def) return

      // Get drop position from event coordinates
      const x = (event as any).activatorEvent?.clientX ?? 100
      const y = (event as any).activatorEvent?.clientY ?? 100

      const newNode: ComponentNode = {
        id: generateId(),
        type: activeData.type,
        props: { ...def.defaultProps },
        bindings: {},
        children: [],
        parentId: null,
        locked: false,
        visible: true,
        style: { x: Math.max(20, x - 200), y: Math.max(20, y - 60) },
      }
      addNode(newNode, null)
      return
    }

    // Tree → Tree reorder
    if (activeData?.kind === 'tree' && overData?.kind === 'tree') {
      moveNode(activeData.nodeId, null, 0)
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
