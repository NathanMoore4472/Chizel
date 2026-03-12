import type { StateCreator } from 'zustand'
import type { EditorState } from '@/types'

export interface SelectionSlice {
  selectedId: string | null
  selectNode: (id: string | null) => void
}

export const createSelectionSlice: StateCreator<EditorState, [['zustand/immer', never]], [], SelectionSlice> = (set) => ({
  selectedId: null,
  selectNode: (id) => {
    set(state => { state.selectedId = id })
  },
})
