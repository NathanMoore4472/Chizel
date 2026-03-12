import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { EditorState } from '@/types'
import { createTreeSlice } from './slices/tree.slice'
import { createSelectionSlice } from './slices/selection.slice'
import { createBindingsSlice } from './slices/bindings.slice'
import { createDataSourcesSlice } from './slices/data-sources.slice'
import { createDragSlice } from './slices/drag.slice'
import { createHistorySlice } from './slices/history.slice'
import { createClipboardSlice } from './slices/clipboard.slice'

export const useEditorStore = create<EditorState>()(
  immer((set, get, store) => ({
    ...createTreeSlice(set, get, store),
    ...createSelectionSlice(set, get, store),
    ...createBindingsSlice(set, get, store),
    ...createDataSourcesSlice(set, get, store),
    ...createDragSlice(set, get, store),
    ...createHistorySlice(set, get, store),
    ...createClipboardSlice(set, get, store),
  }))
)
