import type { ComponentNode } from '@/types/component-node'
import type { DataSourceState } from '@/types/data-source'

interface NodeSnapshot {
  id: string
  type: string
  label: string | undefined
  props: Record<string, unknown>
  index: number
}

export interface EvalContext {
  props: Record<string, unknown>
  state: Record<string, unknown>
  sources: Record<string, unknown>
  node: {
    id: string
    type: string
    parentId: string | null
    index: number
  }
  parent: NodeSnapshot | null
  children: NodeSnapshot[]
  env: {
    now: number
    url: string
  }
}

function snapshot(node: ComponentNode, index: number): NodeSnapshot {
  return {
    id: node.id,
    type: node.type,
    label: node.label,
    props: node.props,
    index,
  }
}

export function buildContext(
  node: ComponentNode,
  dataSourceStates: Record<string, DataSourceState>,
  index = 0,
  parent: ComponentNode | null = null
): EvalContext {
  const sources: Record<string, unknown> = {}
  for (const [name, dsState] of Object.entries(dataSourceStates)) {
    sources[name] = dsState.data
  }

  return {
    props: node.props,
    state: {},
    sources,
    node: {
      id: node.id,
      type: node.type,
      parentId: node.parentId,
      index,
    },
    parent: parent ? snapshot(parent, 0) : null,
    children: node.children.map((c, i) => snapshot(c, i)),
    env: {
      now: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  }
}
