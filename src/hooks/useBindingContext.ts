import { useEditorStore } from '@/store'
import { buildContext, type EvalContext } from '@/engine/context-builder'
import { findNode } from '@/utils/tree-ops'

export function useBindingContext(nodeId: string): EvalContext | null {
  const tree = useEditorStore(s => s.tree)
  const dataSourceStates = useEditorStore(s => s.dataSourceStates)
  const node = findNode(tree, nodeId)
  if (!node) return null
  return buildContext(node, dataSourceStates)
}
