import type { ComponentNode } from '@/types/component-node'
import type { DataSourceState } from '@/types/data-source'

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
  env: {
    now: number
    url: string
  }
}

export function buildContext(
  node: ComponentNode,
  dataSourceStates: Record<string, DataSourceState>,
  index = 0
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
    env: {
      now: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  }
}
