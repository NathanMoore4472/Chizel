import type { ComponentNode } from '@/types/component-node'
import { deepClone } from './deep-clone'

/** Find a node by id in tree (returns null if not found) */
export function findNode(root: ComponentNode[], id: string): ComponentNode | null {
  for (const node of root) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

/** Find parent of node with given id */
export function findParent(root: ComponentNode[], id: string): ComponentNode | null {
  for (const node of root) {
    if (node.children.some(c => c.id === id)) return node
    const found = findParent(node.children, id)
    if (found) return found
  }
  return null
}

/** Remove a node from the tree by id. Returns [newTree, removedNode] */
export function removeNode(root: ComponentNode[], id: string): [ComponentNode[], ComponentNode | null] {
  let removed: ComponentNode | null = null
  function recurse(nodes: ComponentNode[]): ComponentNode[] {
    return nodes.filter(n => {
      if (n.id === id) { removed = n; return false }
      n = { ...n, children: recurse(n.children) }
      return true
    }).map(n => ({ ...n, children: recurse([]).length === 0 ? n.children : recurse(n.children) }))
  }
  // Simpler implementation:
  function remove(nodes: ComponentNode[]): ComponentNode[] {
    const result: ComponentNode[] = []
    for (const node of nodes) {
      if (node.id === id) {
        removed = node
      } else {
        result.push({ ...node, children: remove(node.children) })
      }
    }
    return result
  }
  const newRoot = remove(root)
  return [newRoot, removed]
}

/** Insert a node at a given index under a parent (or at root level if parentId is null) */
export function insertNode(
  root: ComponentNode[],
  node: ComponentNode,
  parentId: string | null,
  index: number
): ComponentNode[] {
  if (parentId === null) {
    const result = [...root]
    result.splice(index, 0, node)
    return result
  }
  return root.map(n => {
    if (n.id === parentId) {
      const children = [...n.children]
      children.splice(index, 0, node)
      return { ...n, children }
    }
    return { ...n, children: insertNode(n.children, node, parentId, index) }
  })
}

/** Move a node from its current position to a new parent/index */
export function moveNode(
  root: ComponentNode[],
  nodeId: string,
  newParentId: string | null,
  newIndex: number
): ComponentNode[] {
  const [withoutNode, node] = removeNode(root, nodeId)
  if (!node) return root
  const updated = { ...node, parentId: newParentId }
  return insertNode(withoutNode, updated, newParentId, newIndex)
}

/** Flatten tree to array (depth-first) */
export function flattenTree(root: ComponentNode[]): ComponentNode[] {
  const result: ComponentNode[] = []
  function traverse(nodes: ComponentNode[]) {
    for (const node of nodes) {
      result.push(node)
      traverse(node.children)
    }
  }
  traverse(root)
  return result
}

/** Update a node's properties by id (immutable) */
export function updateNodeById(
  root: ComponentNode[],
  id: string,
  updater: (node: ComponentNode) => ComponentNode
): ComponentNode[] {
  return root.map(node => {
    if (node.id === id) return updater(node)
    return { ...node, children: updateNodeById(node.children, id, updater) }
  })
}
