import { useEffect } from 'react'
import { useEditorStore } from '@/store'
import { startPolling, stopPolling } from '@/engine/data-source-runner'
import type { RestDataSource } from '@/types/data-source'

export function useDataSource(sourceName: string) {
  const dataSources = useEditorStore(s => s.dataSources)
  const dataSourceStates = useEditorStore(s => s.dataSourceStates)
  const setDataSourceState = useEditorStore(s => s.setDataSourceState)

  const source = dataSources.find(ds => ds.name === sourceName)
  const state = dataSourceStates[sourceName]

  useEffect(() => {
    if (!source || source.kind !== 'rest' || !source.enabled) return
    const restSource = source as RestDataSource
    startPolling(restSource, {
      onData: (data) => setDataSourceState(sourceName, { data, lastFetched: Date.now() }),
      onError: (error) => setDataSourceState(sourceName, { error }),
      onLoading: (loading) => setDataSourceState(sourceName, { loading }),
    })
    return () => stopPolling(sourceName)
  }, [source, sourceName, setDataSourceState])

  return { source, state }
}
