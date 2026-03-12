import type { StateCreator } from 'zustand'
import type { EditorState } from '@/types'
import type { ComponentNode } from '@/types/component-node'
import {
  insertNode,
  removeNode as removeNodeOp,
  moveNode as moveNodeOp,
  updateNodeById,
} from '@/utils/tree-ops'
import { deepClone } from '@/utils/deep-clone'

export interface TreeSlice {
  tree: ComponentNode[]
  addNode: (node: ComponentNode, parentId: string | null, x?: number, y?: number) => void
  removeNode: (id: string) => void
  moveNode: (nodeId: string, newParentId: string | null, newIndex: number) => void
  updateNodeProps: (id: string, props: Record<string, unknown>) => void
  updateNodeStyle: (id: string, style: ComponentNode['style']) => void
  updateNodeLabel: (id: string, label: string) => void
  setNodeVisible: (id: string, visible: boolean) => void
  setNodeLocked: (id: string, locked: boolean) => void
  duplicateNode: (id: string) => void
}

const ROOT_FRAME_ID = 'root-frame'

export { ROOT_FRAME_ID }

const initialTree: ComponentNode[] = [
  {
    id: ROOT_FRAME_ID,
    type: 'Frame',
    label: 'Frame',
    props: {
      layout: 'absolute',
      direction: 'column',
      gap: 16,
      padding: 24,
      background: '#1e1e1e',
      align: 'flex-start',
      justify: 'flex-start',
    },
    bindings: {},
    children: [],
    parentId: null,
    locked: false,
    visible: true,
  },
]

export const createTreeSlice: StateCreator<EditorState, [['zustand/immer', never]], [], TreeSlice> = (set, get) => ({
  tree: initialTree,

  addNode: (node, parentId, x, y) => {
    get().snapshot()
    set(state => {
      const newNode: ComponentNode = {
        ...node,
        parentId,
        style: x !== undefined && y !== undefined ? { ...node.style, x, y } : node.style,
      }
      const index = parentId
        ? (state.tree.find(n => n.id === parentId)?.children.length ?? 0)
        : state.tree.length
      state.tree = insertNode(state.tree, newNode, parentId, index)
    })
  },

  removeNode: (id) => {
    get().snapshot()
    set(state => {
      const [newTree] = removeNodeOp(state.tree, id)
      state.tree = newTree
      if (state.selectedId === id) state.selectedId = null
    })
  },

  moveNode: (nodeId, newParentId, newIndex) => {
    get().snapshot()
    set(state => {
      state.tree = moveNodeOp(state.tree, nodeId, newParentId, newIndex)
    })
  },

  updateNodeProps: (id, props) => {
    set(state => {
      state.tree = updateNodeById(state.tree, id, node => ({
        ...node,
        props: { ...node.props, ...props },
      }))
    })
  },

  updateNodeStyle: (id, style) => {
    set(state => {
      state.tree = updateNodeById(state.tree, id, node => ({
        ...node,
        style: { ...node.style, ...style },
      }))
    })
  },

  updateNodeLabel: (id, label) => {
    set(state => {
      state.tree = updateNodeById(state.tree, id, node => ({ ...node, label }))
    })
  },

  setNodeVisible: (id, visible) => {
    set(state => {
      state.tree = updateNodeById(state.tree, id, node => ({ ...node, visible }))
    })
  },

  setNodeLocked: (id, locked) => {
    set(state => {
      state.tree = updateNodeById(state.tree, id, node => ({ ...node, locked }))
    })
  },

  duplicateNode: (id) => {
    get().snapshot()
    set(state => {
      function findAndDuplicate(nodes: ComponentNode[], targetId: string): ComponentNode[] {
        const result: ComponentNode[] = []
        for (const node of nodes) {
          result.push({ ...node, children: findAndDuplicate(node.children, targetId) })
          if (node.id === targetId) {
            const clone = deepClone(node)
            // Generate new IDs for the clone
            function reId(n: ComponentNode): ComponentNode {
              return {
                ...n,
                id: Math.random().toString(36).slice(2, 10),
                children: n.children.map(reId),
              }
            }
            result.push(reId(clone))
          }
        }
        return result
      }
      state.tree = findAndDuplicate(state.tree, id)
    })
  },
})
