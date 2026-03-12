import type { StateCreator } from 'zustand'
import type { EditorState } from '@/types'
import type { Binding } from '@/types/binding'
import { updateNodeById } from '@/utils/tree-ops'

export interface BindingsSlice {
  setBinding: (nodeId: string, propName: string, binding: Binding) => void
  removeBinding: (nodeId: string, propName: string) => void
}

export const createBindingsSlice: StateCreator<EditorState, [['zustand/immer', never]], [], BindingsSlice> = (set) => ({
  setBinding: (nodeId, propName, binding) => {
    set(state => {
      state.tree = updateNodeById(state.tree, nodeId, node => ({
        ...node,
        bindings: { ...node.bindings, [propName]: binding },
      }))
    })
  },

  removeBinding: (nodeId, propName) => {
    set(state => {
      state.tree = updateNodeById(state.tree, nodeId, node => {
        const bindings = { ...node.bindings }
        delete bindings[propName]
        return { ...node, bindings }
      })
    })
  },
})
