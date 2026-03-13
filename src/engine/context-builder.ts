import type { ComponentNode } from '@/types/component-node'
import type { DataSourceState } from '@/types/data-source'

interface NodeSnapshot {
  id: string
  type: string
  label: string | undefined
  props: Record<string, unknown>
  index: number
}

export interface CtxActions {
  /**
   * Update props on a node.
   * - setProps(patch)           → updates the current node
   * - setProps(nodeId, patch)   → updates any node by id
   */
  setProps(patch: Record<string, unknown>): void
  setProps(nodeId: string, patch: Record<string, unknown>): void
}

export interface EvalContext {
  props: Record<string, unknown>
  state: Record<string, unknown>
  sources: Record<string, unknown>
  /** Full data source states — useful for debugging: ctx.sourceStates.DB.error / .loading / .lastFetched */
  sourceStates: Record<string, unknown>
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
  /** Write-back actions available inside event handlers */
  actions: CtxActions
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

/** Passed in by NodeRenderer so event handlers can call store actions */
export interface ContextActions {
  updateNodeProps: (id: string, props: Record<string, unknown>) => void
}

export function buildContext(
  node: ComponentNode,
  dataSourceStates: Record<string, DataSourceState>,
  index = 0,
  parent: ComponentNode | null = null,
  storeActions?: ContextActions
): EvalContext {
  const sources: Record<string, unknown> = {}
  for (const [name, dsState] of Object.entries(dataSourceStates)) {
    sources[name] = dsState.data
  }

  const actions: CtxActions = {
    setProps(nodeIdOrPatch: string | Record<string, unknown>, patch?: Record<string, unknown>) {
      if (!storeActions) {
        console.warn('[Chizel] ctx.actions.setProps called outside of an event handler')
        return
      }
      if (typeof nodeIdOrPatch === 'string' && patch) {
        storeActions.updateNodeProps(nodeIdOrPatch, patch)
      } else if (typeof nodeIdOrPatch === 'object') {
        storeActions.updateNodeProps(node.id, nodeIdOrPatch)
      }
    },
  }

  return {
    props: node.props,
    state: {},
    sources,
    sourceStates: dataSourceStates,
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
    actions,
  }
}
