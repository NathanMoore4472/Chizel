import type { StateCreator } from 'zustand'
import type { EditorState, HistoryEntry } from '@/types'
import { deepClone } from '@/utils/deep-clone'

const MAX_HISTORY = 50

export interface HistorySlice {
  history: {
    past: HistoryEntry[]
    future: HistoryEntry[]
  }
  undo: () => void
  redo: () => void
  snapshot: () => void
  previewMode: boolean
  togglePreviewMode: () => void
  zoom: number
  setZoom: (zoom: number) => void
}

export const createHistorySlice: StateCreator<EditorState, [['zustand/immer', never]], [], HistorySlice> = (set, get) => ({
  history: {
    past: [],
    future: [],
  },
  previewMode: false,
  zoom: 1,

  snapshot: () => {
    set(state => {
      const entry: HistoryEntry = {
        tree: deepClone(state.tree),
        timestamp: Date.now(),
      }
      state.history.past = [...state.history.past.slice(-MAX_HISTORY + 1), entry]
      state.history.future = []
    })
  },

  undo: () => {
    set(state => {
      const past = state.history.past
      if (past.length === 0) return
      const entry = past[past.length - 1]
      state.history.future = [
        { tree: deepClone(state.tree), timestamp: Date.now() },
        ...state.history.future,
      ]
      state.history.past = past.slice(0, -1)
      state.tree = entry.tree
    })
  },

  redo: () => {
    set(state => {
      const future = state.history.future
      if (future.length === 0) return
      const entry = future[0]
      state.history.past = [
        ...state.history.past,
        { tree: deepClone(state.tree), timestamp: Date.now() },
      ]
      state.history.future = future.slice(1)
      state.tree = entry.tree
    })
  },

  togglePreviewMode: () => {
    set(state => { state.previewMode = !state.previewMode })
  },

  setZoom: (zoom) => {
    set(state => { state.zoom = zoom })
  },
})
