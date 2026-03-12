import type { StateCreator } from 'zustand'
import type { EditorState } from '@/types'

export interface DragSlice {
  draggingId: string | null
  setDraggingId: (id: string | null) => void
}

export const createDragSlice: StateCreator<EditorState, [['zustand/immer', never]], [], DragSlice> = (set) => ({
  draggingId: null,
  setDraggingId: (id) => {
    set(state => { state.draggingId = id })
  },
})
