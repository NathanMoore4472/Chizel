import React, { useEffect } from 'react'
import NodeRenderer from '@/canvas/NodeRenderer'
import DataSourceManager from '@/engine/DataSourceManager'
import type { ComponentNode } from '@/types/component-node'
import type { DataSource } from '@/types/data-source'
import { useViewerStore } from './viewer-store'

// ── Load view data from embedded JSON script tag ─────────────────────────────

function loadViewData(): { tree: ComponentNode[]; dataSources: DataSource[] } | null {
  try {
    const el = document.getElementById('chizel-data')
    if (!el?.textContent) return null
    return JSON.parse(el.textContent)
  } catch {
    return null
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function ViewerApp() {
  const tree = useViewerStore(s => s.tree)

  useEffect(() => {
    const data = loadViewData()
    if (!data) return
    useViewerStore.setState({
      tree: data.tree ?? [],
      dataSources: data.dataSources ?? [],
      dataSourceStates: Object.fromEntries(
        (data.dataSources ?? []).map(ds => [
          ds.name,
          { data: ds.kind === 'store' ? (ds as any).initialData : null, loading: false, error: null, lastFetched: null }
        ])
      ),
    })
  }, [])

  const rootFrame = tree.find(n => n.type === 'Frame')

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <DataSourceManager />
      {rootFrame ? (
        <NodeRenderer node={rootFrame} isRoot />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#858585', fontSize: 14 }}>
          No view data found
        </div>
      )}
    </div>
  )
}
