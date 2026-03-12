import React, { useState, useEffect, lazy, Suspense } from 'react'
import { registerComponent } from '../index'
import { string, number, enumOf } from '../schema-helpers'
import { loadViewFile, injectParams, type ViewFile } from '@/engine/view-loader'
import type { ComponentNode } from '@/types/component-node'

const NodeRenderer = lazy(() => import('@/canvas/NodeRenderer'))

/** Parse instances prop — accepts a real array or a JSON string */
function parseInstances(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

interface RepeaterItemProps {
  tree: ViewFile['tree']
  params: Record<string, unknown>
  index: number
}

function RepeaterItem({ tree, params, index }: RepeaterItemProps) {
  const mergedTree = injectParams(tree, { ...params, _index: index })
  const rootFrame = mergedTree.find(n => n.type === 'Frame') as ComponentNode | undefined
  if (!rootFrame) return null
  return (
    <Suspense fallback={null}>
      <NodeRenderer node={rootFrame} index={index} />
    </Suspense>
  )
}

interface RepeaterInnerProps {
  viewPath: string
  instances: Record<string, unknown>[]
  direction: string
  gap: number
  padding: number
  align: string
  justify: string
  wrap: string
}

function FlexRepeaterInner({ viewPath, instances, direction, gap, padding, align, justify, wrap }: RepeaterInnerProps) {
  const [view, setView] = useState<ViewFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!viewPath.trim()) return
    setView(null)
    setError(null)
    loadViewFile(viewPath)
      .then(setView)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
  }, [viewPath])

  if (!viewPath.trim()) {
    return <Placeholder label="FlexRepeater" sub="Set a viewPath to load a view" />
  }
  if (error) {
    return <Placeholder label="Failed to load" sub={error} error />
  }
  if (!view) {
    return <Placeholder label="Loading…" />
  }
  if (instances.length === 0) {
    return <Placeholder label="FlexRepeater" sub="instances is empty" />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction as React.CSSProperties['flexDirection'],
        flexWrap: wrap as React.CSSProperties['flexWrap'],
        gap,
        padding,
        alignItems: align,
        justifyContent: justify,
      }}
    >
      {instances.map((item, i) => (
        <RepeaterItem key={i} tree={view.tree} params={item} index={i} />
      ))}
    </div>
  )
}

const placeholderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 80,
  border: '1px dashed #3c3c3c',
  borderRadius: 4,
  color: '#858585',
  padding: 12,
  textAlign: 'center',
}

function Placeholder({ label, sub, error: isError }: { label: string; sub?: string; error?: boolean }) {
  return (
    <div style={{ ...placeholderStyle, borderColor: isError ? '#f87171' : '#3c3c3c', color: isError ? '#f87171' : '#858585' }}>
      <div style={{ fontSize: 11 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, wordBreak: 'break-all' }}>{sub}</div>}
    </div>
  )
}

registerComponent({
  type: 'FlexRepeater',
  label: 'Flex Repeater',
  category: 'Layout',
  description: 'Repeats an embedded view for each item in an instances array, passing key-value pairs as props',
  propSchema: {
    viewPath: string({ label: 'View Path (.chizel)', placeholder: '/path/to/view.chizel', defaultValue: '' }),
    instances: string({
      label: 'Instances (JSON array or binding)',
      placeholder: '[{"name":"Alice"},{"name":"Bob"}]',
      defaultValue: '[]',
      multiline: true,
    }),
    direction: enumOf(
      [
        { value: 'column', label: 'Vertical' },
        { value: 'row', label: 'Horizontal' },
        { value: 'row-reverse', label: 'Horizontal (reversed)' },
        { value: 'column-reverse', label: 'Vertical (reversed)' },
      ],
      { label: 'Direction', defaultValue: 'column' }
    ),
    wrap: enumOf(
      [
        { value: 'nowrap', label: 'No Wrap' },
        { value: 'wrap', label: 'Wrap' },
      ],
      { label: 'Wrap', defaultValue: 'nowrap' }
    ),
    gap: number({ label: 'Gap', min: 0, max: 100, step: 1, defaultValue: 8 }),
    padding: number({ label: 'Padding', min: 0, max: 100, step: 1, defaultValue: 0 }),
    align: enumOf(
      [
        { value: 'flex-start', label: 'Start' },
        { value: 'center', label: 'Center' },
        { value: 'flex-end', label: 'End' },
        { value: 'stretch', label: 'Stretch' },
      ],
      { label: 'Align Items', defaultValue: 'flex-start' }
    ),
    justify: enumOf(
      [
        { value: 'flex-start', label: 'Start' },
        { value: 'center', label: 'Center' },
        { value: 'flex-end', label: 'End' },
        { value: 'space-between', label: 'Space Between' },
        { value: 'space-around', label: 'Space Around' },
        { value: 'space-evenly', label: 'Space Evenly' },
      ],
      { label: 'Justify Content', defaultValue: 'flex-start' }
    ),
  },
  defaultProps: {
    viewPath: '',
    instances: '[]',
    direction: 'column',
    wrap: 'nowrap',
    gap: 8,
    padding: 0,
    align: 'flex-start',
    justify: 'flex-start',
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const {
      viewPath, instances: rawInstances,
      direction, wrap, gap, padding, align, justify,
    } = resolvedProps as {
      viewPath: string
      instances: unknown
      direction: string
      wrap: string
      gap: number
      padding: number
      align: string
      justify: string
    }

    const instances = parseInstances(rawInstances)

    return (
      <FlexRepeaterInner
        viewPath={viewPath ?? ''}
        instances={instances}
        direction={direction}
        wrap={wrap}
        gap={gap}
        padding={padding}
        align={align}
        justify={justify}
      />
    )
  },
})
