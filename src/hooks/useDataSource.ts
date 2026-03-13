import { useEffect } from 'react'
import { useEditorStore } from '@/store'
import { startPolling, stopPolling } from '@/engine/data-source-runner'

export function useDataSource(sourceName: string) {
  const dataSources = useEditorStore(s => s.dataSources)
  const dataSourceStates = useEditorStore(s => s.dataSourceStates)
  const setDataSourceState = useEditorStore(s => s.setDataSourceState)

  const source = dataSources.find(ds => ds.name === sourceName)
  const state = dataSourceStates[sourceName]

  useEffect(() => {
    if (!source) return
    if (source.kind !== 'rest' && source.kind !== 'database') return
    if (!source.enabled) return

    startPolling(source, {
      onData: (data) => setDataSourceState(sourceName, { data, lastFetched: Date.now() }),
      onError: (error) => setDataSourceState(sourceName, { error }),
      onLoading: (loading) => setDataSourceState(sourceName, { loading }),
    })
    return () => stopPolling(sourceName)
  }, [source, sourceName, setDataSourceState])

  return { source, state }
}
