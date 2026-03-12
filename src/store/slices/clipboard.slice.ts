import type { StateCreator } from 'zustand'
import type { EditorState } from '@/types'
import type { ComponentNode } from '@/types/component-node'
import { findNode, insertNode, removeNode } from '@/utils/tree-ops'
import { generateId } from '@/utils/id'

export interface ClipboardSlice {
  clipboard: { node: ComponentNode; mode: 'copy' | 'cut' } | null
  copyNode: (id: string) => void
  cutNode: (id: string) => void
  pasteNode: (parentId: string) => void
}

/** Recursively assign new IDs to a node and all its children */
function reIdTree(node: ComponentNode, newParentId: string | null): ComponentNode {
  const newId = generateId()
  return {
    ...node,
    id: newId,
    parentId: newParentId,
    children: node.children.map(c => reIdTree(c, newId)),
  }
}

export const createClipboardSlice: StateCreator<EditorState, [['zustand/immer', never]], [], ClipboardSlice> = (set, get) => ({
  clipboard: null,

  copyNode: (id) => {
    const node = findNode(get().tree, id)
    if (!node) return
    set(state => {
      // Deep-copy via JSON round-trip (safe — nodes are plain serialisable objects)
      state.clipboard = { node: JSON.parse(JSON.stringify(node)), mode: 'copy' }
    })
  },

  cutNode: (id) => {
    const node = findNode(get().tree, id)
    if (!node) return
    get().snapshot()
    set(state => {
      state.clipboard = { node: JSON.parse(JSON.stringify(node)), mode: 'cut' }
      const [newTree] = removeNode(state.tree, id)
      state.tree = newTree
      if (state.selectedId === id) state.selectedId = null
    })
  },

  pasteNode: (parentId) => {
    const { clipboard } = get()
    if (!clipboard) return
    get().snapshot()
    set(state => {
      const fresh = reIdTree(clipboard.node, parentId)
      const index = findNode(state.tree, parentId)?.children.length ?? state.tree.length
      state.tree = insertNode(state.tree, fresh, parentId, index)
      state.selectedId = fresh.id
      // Cut clears clipboard after first paste; copy leaves it for repeated pastes
      if (clipboard.mode === 'cut') state.clipboard = null
    })
  },
})
