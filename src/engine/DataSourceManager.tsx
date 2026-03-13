import { useEffect } from 'react'
import { useEditorStore } from '@/store'
import { startPolling, stopPolling } from './data-source-runner'
import type { RestDataSource, DatabaseDataSource } from '@/types/data-source'

/** Manages polling lifecycle for a single data source */
function SourceRunner({ name }: { name: string }) {
  const source = useEditorStore(s => s.dataSources.find(d => d.name === name))
  const setDataSourceState = useEditorStore(s => s.setDataSourceState)

  useEffect(() => {
    if (!source) return
    if (source.kind !== 'rest' && source.kind !== 'database') return
    if (!source.enabled) return

    startPolling(source as RestDataSource | DatabaseDataSource, {
      onData: (data) => setDataSourceState(name, { data, lastFetched: Date.now() }),
      onError: (error) => setDataSourceState(name, { error }),
      onLoading: (loading) => setDataSourceState(name, { loading }),
    })

    return () => stopPolling(name)
  }, [source, name, setDataSourceState])

  return null
}

/** Mount one SourceRunner per data source — add this once at the app root */
export default function DataSourceManager() {
  // Select the array itself (stable Immer reference) — do NOT call .map() in
  // the selector, as that creates a new array on every render and triggers an
  // infinite getSnapshot loop in Zustand.
  const dataSources = useEditorStore(s => s.dataSources)

  return (
    <>
      {dataSources.map(ds => <SourceRunner key={ds.name} name={ds.name} />)}
    </>
  )
}
