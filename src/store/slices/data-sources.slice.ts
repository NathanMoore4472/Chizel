import type { StateCreator } from 'zustand'
import type { EditorState } from '@/types'
import type { DataSource, DataSourceState } from '@/types/data-source'

export interface DataSourcesSlice {
  dataSources: DataSource[]
  dataSourceStates: Record<string, DataSourceState>
  addDataSource: (ds: DataSource) => void
  removeDataSource: (name: string) => void
  updateDataSource: (name: string, ds: Partial<DataSource>) => void
  setDataSourceState: (name: string, state: Partial<DataSourceState>) => void
}

export const createDataSourcesSlice: StateCreator<EditorState, [['zustand/immer', never]], [], DataSourcesSlice> = (set) => ({
  dataSources: [],
  dataSourceStates: {},

  addDataSource: (ds) => {
    set(state => {
      state.dataSources.push(ds)
      state.dataSourceStates[ds.name] = {
        data: ds.kind === 'store' ? ds.initialData : null,
        loading: false,
        error: null,
        lastFetched: null,
      }
    })
  },

  removeDataSource: (name) => {
    set(state => {
      state.dataSources = state.dataSources.filter(ds => ds.name !== name)
      delete state.dataSourceStates[name]
    })
  },

  updateDataSource: (name, partial) => {
    set(state => {
      const idx = state.dataSources.findIndex(ds => ds.name === name)
      if (idx !== -1) {
        state.dataSources[idx] = { ...state.dataSources[idx], ...partial } as DataSource
      }
    })
  },

  setDataSourceState: (name, partial) => {
    set(state => {
      if (!state.dataSourceStates[name]) {
        state.dataSourceStates[name] = { data: null, loading: false, error: null, lastFetched: null }
      }
      Object.assign(state.dataSourceStates[name], partial)
    })
  },
})
