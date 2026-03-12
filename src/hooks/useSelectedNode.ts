import { useEditorStore } from '@/store'
import { findNode } from '@/utils/tree-ops'
import type { ComponentNode } from '@/types/component-node'

export function useSelectedNode(): ComponentNode | null {
  const selectedId = useEditorStore(s => s.selectedId)
  const tree = useEditorStore(s => s.tree)
  if (!selectedId) return null
  return findNode(tree, selectedId)
}
