import React, { useState, useCallback, useEffect } from 'react'
import chizelLogo from '../../icons/Chizel.svg'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useEditorStore } from '@/store'
import { ROOT_FRAME_ID } from '@/store/slices/tree.slice'
import { generateId } from '@/utils/id'
import { getComponent } from '@/registry'
import { findNode } from '@/utils/tree-ops'
import Canvas from '@/canvas/Canvas'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import ResizeHandle from './ResizeHandle'
import FileMenu from './FileMenu'
import { isTauri, saveProjectFile, openProjectFile } from '@/utils/file-ops'
import type { ComponentNode } from '@/types/component-node'

// Pick the smallest (innermost) droppable container the pointer is within.
// Falls back to the first result if areas can't be determined.
const innermostContainer: CollisionDetection = (args) => {
  const collisions = pointerWithin(args)
  if (collisions.length <= 1) return collisions
  return collisions.sort((a, b) => {
    const ra = args.droppableRects.get(a.id)
    const rb = args.droppableRects.get(b.id)
    if (!ra || !rb) return 0
    return ra.width * ra.height - rb.width * rb.height
  }).slice(0, 1)
}

export default function AppLayout() {
  const [leftWidth, setLeftWidth] = useState(220)
  const [rightWidth, setRightWidth] = useState(260)
  const addNode = useEditorStore(s => s.addNode)
  const moveNode = useEditorStore(s => s.moveNode)
  const setDraggingId = useEditorStore(s => s.setDraggingId)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const copyNode = useEditorStore(s => s.copyNode)
  const cutNode = useEditorStore(s => s.cutNode)
  const pasteNode = useEditorStore(s => s.pasteNode)
  const removeNode = useEditorStore(s => s.removeNode)

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

    // Palette → container (Frame or any acceptsChildren node)
    if (activeData?.kind === 'palette') {
      if (over?.data.current?.kind === 'tree') return

      const def = getComponent(activeData.type)
      if (!def) return

      // Resolve which container to drop into
      const overData = over?.data.current
      const targetId = overData?.kind === 'container' ? overData.nodeId : ROOT_FRAME_ID

      // Get the target container's element for position calculation
      const activatorEvent = event.activatorEvent as MouseEvent
      const dropClientX = activatorEvent.clientX + delta.x
      const dropClientY = activatorEvent.clientY + delta.y

      // Find container element: containers register with data-node-id
      const containerEl = document.querySelector(`[data-node-id="${targetId}"]`) as HTMLElement | null
      const containerRect = containerEl?.getBoundingClientRect()
      const scrollLeft = containerEl?.scrollLeft ?? 0
      const scrollTop = containerEl?.scrollTop ?? 0

      const x = Math.max(0, dropClientX - (containerRect?.left ?? 0) + scrollLeft)
      const y = Math.max(0, dropClientY - (containerRect?.top ?? 0) + scrollTop)

      // Check if the target container uses absolute layout
      const tree = useEditorStore.getState().tree
      const targetNode = findNode(tree, targetId)
      const targetDef = getComponent(targetNode?.type ?? '')
      const isAbsolute = targetDef?.childLayout?.(targetNode?.props ?? {}) === 'absolute'

      const newNode: ComponentNode = {
        id: generateId(),
        type: activeData.type,
        props: { ...def.defaultProps },
        bindings: {},
        customProps: [],
        events: {},
        extraClasses: '',
        customCss: '',
        children: [],
        parentId: targetId,
        locked: false,
        visible: true,
        style: isAbsolute ? { x, y } : undefined,
      }
      addNode(newNode, targetId)
      return
    }

    // Tree → Tree reorder
    if (active.data.current?.kind === 'tree' && over?.data.current?.kind === 'tree') {
      moveNode(active.data.current.nodeId, null, 0)
    }
  }, [addNode, moveNode, setDraggingId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return }

      if (mod && e.key === 's' && isTauri()) {
        e.preventDefault()
        const { tree, dataSources, currentFilePath, setCurrentFilePath } = useEditorStore.getState()
        const json = JSON.stringify({ tree, dataSources }, null, 2)
        const path = await saveProjectFile(json, e.shiftKey ? undefined : (currentFilePath ?? undefined))
        if (path) setCurrentFilePath(path)
        return
      }
      if (mod && e.key === 'o' && isTauri()) {
        e.preventDefault()
        const result = await openProjectFile()
        if (!result) return
        const { path, data } = result as { path: string; data: { tree: any; dataSources: any } }
        useEditorStore.getState().loadState({ tree: data.tree, dataSources: data.dataSources ?? [] })
        useEditorStore.getState().setCurrentFilePath(path)
        return
      }

      const selectedId = useEditorStore.getState().selectedId
      if (mod && e.key === 'c' && selectedId) { e.preventDefault(); copyNode(selectedId); return }
      if (mod && e.key === 'x' && selectedId) { e.preventDefault(); cutNode(selectedId); return }
      if (mod && e.key === 'v') {
        e.preventDefault()
        const { clipboard, selectedId: sel } = useEditorStore.getState()
        if (!clipboard) return
        pasteNode(sel ?? ROOT_FRAME_ID)
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeNode(selectedId)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  return (
    <DndContext sensors={sensors} collisionDetection={innermostContainer} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-screen overflow-hidden bg-editor-bg">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-editor-panel border-b border-editor-border flex items-center px-3 gap-3 z-50">
          <img src={chizelLogo} alt="Chizel" className="h-4 w-auto" />
          <FileMenu />
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
