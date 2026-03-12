import React, { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { ComponentNode } from '@/types/component-node'
import { getComponent } from '@/registry'
import { evaluateBinding } from '@/engine/binding-evaluator'
import { buildContext } from '@/engine/context-builder'
import { buildEventHandlers } from '@/engine/event-executor'
import { useEditorStore } from '@/store'
import SelectionOverlay from './SelectionOverlay'

interface Props {
  node: ComponentNode
  parent?: ComponentNode | null
  index?: number
  isRoot?: boolean
}

export default function NodeRenderer({ node, parent = null, index = 0, isRoot = false }: Props) {
  const dataSourceStates = useEditorStore(s => s.dataSourceStates)
  const previewMode = useEditorStore(s => s.previewMode)

  const def = getComponent(node.type)
  const acceptsChildren = def?.acceptsChildren ?? false

  // Always call useDroppable — apply ref only when acceptsChildren is true
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `container:${node.id}`,
    data: { kind: 'container', nodeId: node.id },
    disabled: !acceptsChildren || previewMode,
  })

  const updateNodeProps = useEditorStore(s => s.updateNodeProps)

  const resolvedProps = useMemo(() => {
    const ctx = buildContext(node, dataSourceStates, index, parent, { updateNodeProps })
    const resolved: Record<string, unknown> = { ...node.props }
    for (const [propName, binding] of Object.entries(node.bindings)) {
      try {
        resolved[propName] = evaluateBinding(binding, ctx)
      } catch {
        resolved[propName] = node.props[propName]
      }
    }
    // Inject event handlers — only active in preview mode so edit-mode
    // click events don't fire while selecting components
    if (previewMode && node.events && Object.keys(node.events).length > 0) {
      const handlers = buildEventHandlers(node.events, ctx)
      Object.assign(resolved, handlers)
    }
    return resolved
  }, [node, dataSourceStates, index, parent, previewMode, updateNodeProps])

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
        <RenderedNode node={node} def={def} resolvedProps={resolvedProps} dropRef={null} isOver={false} />
      </div>
    )
  }

  const content = (
    <RenderedNode
      node={node}
      def={def}
      resolvedProps={resolvedProps}
      dropRef={acceptsChildren ? setDropRef : null}
      isOver={isOver && !previewMode}
    />
  )

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
  dropRef,
  isOver,
}: {
  node: ComponentNode
  def: ReturnType<typeof getComponent>
  resolvedProps: Record<string, unknown>
  dropRef: ((el: HTMLElement | null) => void) | null
  isOver: boolean
}) {
  if (!def) return null

  const layout = def?.childLayout?.(resolvedProps) ?? 'flow'

  const children = node.children.length > 0 ? (
    <React.Fragment>
      {node.children.map((child, i) =>
        layout === 'absolute' ? (
          <div
            key={child.id}
            style={{
              position: 'absolute',
              left: child.style?.x ?? 0,
              top: child.style?.y ?? 0,
              width: child.style?.width,
              height: child.style?.height,
            }}
          >
            <NodeRenderer node={child} parent={node} index={i} />
          </div>
        ) : (
          <NodeRenderer key={child.id} node={child} parent={node} index={i} />
        )
      )}
    </React.Fragment>
  ) : undefined

  let rendered: React.ReactNode
  try {
    rendered = (
      <def.render
        node={node}
        resolvedProps={resolvedProps}
        children={children}
      />
    )
  } catch (e) {
    rendered = (
      <div className="border border-dashed border-red-500 p-2 text-red-400 text-xs rounded">
        Render error: {e instanceof Error ? e.message : String(e)}
      </div>
    )
  }

  const hasCustomStyle = node.extraClasses || node.customCss
  // Unique CSS class for scoping custom CSS rules
  const scopeClass = `cn-${node.id}`

  // Classes applied to the wrapper: user's extra classes + scope class (for CSS targeting)
  const wrapperClass = [node.extraClasses, node.customCss ? scopeClass : ''].filter(Boolean).join(' ') || undefined

  // Wrap with droppable ref + over-highlight for container nodes
  if (dropRef) {
    return (
      <div
        ref={dropRef}
        data-node-id={node.id}
        className={wrapperClass}
        style={{
          position: 'relative',
          outline: isOver ? '2px dashed #3b82f6' : undefined,
          outlineOffset: '-2px',
          background: isOver ? 'rgba(59,130,246,0.06)' : undefined,
          borderRadius: 4,
        }}
      >
        {node.customCss && (
          <style>{`.${scopeClass} { ${node.customCss} }`}</style>
        )}
        {rendered}
      </div>
    )
  }

  // For leaf nodes only add a wrapper when needed
  if (hasCustomStyle) {
    return (
      <div className={wrapperClass} data-node-id={node.id}>
        {node.customCss && (
          <style>{`.${scopeClass} { ${node.customCss} }`}</style>
        )}
        {rendered}
      </div>
    )
  }

  return <>{rendered}</>
}
