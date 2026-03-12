import React, { useState, useEffect, lazy, Suspense } from 'react'
import { registerComponent } from '../index'
import { string } from '../schema-helpers'
import { loadViewFile, injectParams, type ViewFile } from '@/engine/view-loader'
import type { ComponentNode } from '@/types/component-node'

// Lazy-import NodeRenderer to avoid issues at registration time
const NodeRenderer = lazy(() => import('@/canvas/NodeRenderer'))

interface EmbeddedViewInnerProps {
  src: string
  params: Record<string, unknown>
}

function EmbeddedViewInner({ src, params }: EmbeddedViewInnerProps) {
  const [view, setView] = useState<ViewFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!src.trim()) return
    setView(null)
    setError(null)
    loadViewFile(src)
      .then(setView)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
  }, [src])

  if (!src.trim()) {
    return (
      <div style={placeholderStyle}>
        <div style={{ fontSize: 11, opacity: 0.5 }}>EmbeddedView</div>
        <div style={{ fontSize: 10, opacity: 0.4 }}>Set a src path to load a view</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ ...placeholderStyle, borderColor: '#f87171', color: '#f87171' }}>
        <div style={{ fontSize: 11 }}>Failed to load</div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, wordBreak: 'break-all' }}>{error}</div>
      </div>
    )
  }

  if (!view) {
    return (
      <div style={placeholderStyle}>
        <div style={{ fontSize: 11, opacity: 0.5 }}>Loading…</div>
      </div>
    )
  }

  const mergedTree = injectParams(view.tree, params)
  const rootFrame = mergedTree.find(n => n.type === 'Frame') as ComponentNode | undefined

  if (!rootFrame) {
    return (
      <div style={{ ...placeholderStyle, borderColor: '#fbbf24', color: '#fbbf24' }}>
        <div style={{ fontSize: 11 }}>No Frame found in view</div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div style={placeholderStyle}><div style={{ fontSize: 11 }}>Rendering…</div></div>}>
      <NodeRenderer node={rootFrame} />
    </Suspense>
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

registerComponent({
  type: 'EmbeddedView',
  label: 'Embedded View',
  category: 'Layout',
  description: 'Embeds another .chizel view file with optional param overrides',
  propSchema: {
    src: string({ label: 'View Path (.chizel)', placeholder: '/path/to/view.chizel', defaultValue: '' }),
  },
  defaultProps: {
    src: '',
  },
  acceptsChildren: false,
  render: ({ resolvedProps, node }) => {
    const src = (resolvedProps.src as string) ?? ''

    // Collect param values from node.props (anything not in propSchema is a discovered param)
    const schemaKeys = new Set(['src'])
    const params: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node.props)) {
      if (!schemaKeys.has(k)) params[k] = v
    }
    // Also include any custom props the user added
    for (const cp of node.customProps) {
      params[cp.name] = node.props[cp.name]
    }

    return <EmbeddedViewInner src={src} params={params} />
  },
})
