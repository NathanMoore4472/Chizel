import React, { useMemo } from 'react'
import type { ComponentNode } from '@/types/component-node'
import { getComponent } from '@/registry'
import { evaluateBinding } from '@/engine/binding-evaluator'
import { buildContext } from '@/engine/context-builder'
import { useEditorStore } from '@/store'
import SelectionOverlay from './SelectionOverlay'

interface Props {
  node: ComponentNode
  isRoot?: boolean
}

export default function NodeRenderer({ node, isRoot = false }: Props) {
  const dataSourceStates = useEditorStore(s => s.dataSourceStates)
  const previewMode = useEditorStore(s => s.previewMode)

  const def = getComponent(node.type)

  const resolvedProps = useMemo(() => {
    const ctx = buildContext(node, dataSourceStates)
    const resolved: Record<string, unknown> = { ...node.props }
    for (const [propName, binding] of Object.entries(node.bindings)) {
      try {
        resolved[propName] = evaluateBinding(binding, ctx)
      } catch {
        resolved[propName] = node.props[propName]
      }
    }
    return resolved
  }, [node, dataSourceStates])

  if (!def) {
    return (
      <div className="border border-dashed border-red-500 p-2 text-red-400 text-xs rounded">
        Unknown: {node.type}
      </div>
    )
  }

  if (!node.visible) {
    if (previewMode) return null
    return (
      <div className="opacity-30">
        <RenderedNode node={node} def={def} resolvedProps={resolvedProps} />
      </div>
    )
  }

  const content = <RenderedNode node={node} def={def} resolvedProps={resolvedProps} />

  if (previewMode) return content

  return (
    <SelectionOverlay node={node}>
      {content}
    </SelectionOverlay>
  )
}

function RenderedNode({
  node,
  def,
  resolvedProps,
}: {
  node: ComponentNode
  def: ReturnType<typeof getComponent>
  resolvedProps: Record<string, unknown>
}) {
  if (!def) return null

  const children = node.children.length > 0 ? (
    <React.Fragment>
      {node.children.map(child => (
        <NodeRenderer key={child.id} node={child} />
      ))}
    </React.Fragment>
  ) : undefined

  try {
    return (
      <def.render
        node={node}
        resolvedProps={resolvedProps}
        children={children}
      />
    )
  } catch (e) {
    return (
      <div className="border border-dashed border-red-500 p-2 text-red-400 text-xs rounded">
        Render error: {e instanceof Error ? e.message : String(e)}
      </div>
    )
  }
}
