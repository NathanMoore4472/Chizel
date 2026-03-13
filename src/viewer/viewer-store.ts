import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { ComponentNode } from '@/types/component-node'
import type { DataSource, DataSourceState } from '@/types/data-source'
import { updateNodeById } from '@/utils/tree-ops'

export interface ViewerState {
  tree: ComponentNode[]
  dataSources: DataSource[]
  dataSourceStates: Record<string, DataSourceState>
  selectedId: string | null
  previewMode: boolean
  zoom: number
  setDataSourceState: (name: string, partial: Partial<DataSourceState>) => void
  selectNode: (id: string | null) => void
  /** Required by ctx.actions.setProps in event handlers */
  updateNodeProps: (id: string, props: Record<string, unknown>) => void
}

export const useViewerStore = create<ViewerState>()(
  immer((set) => ({
    tree: [],
    dataSources: [],
    dataSourceStates: {},
    selectedId: null,
    previewMode: true,
    zoom: 1,
    setDataSourceState: (name, partial) => {
      set(state => {
        if (!state.dataSourceStates[name]) {
          state.dataSourceStates[name] = { data: null, loading: false, error: null, lastFetched: null }
        }
        Object.assign(state.dataSourceStates[name], partial)
      })
    },
    selectNode: () => {},
    updateNodeProps: (id, props) => {
      set(state => {
        state.tree = updateNodeById(state.tree, id, node => ({
          ...node,
          props: { ...node.props, ...props },
        }))
      })
    },
  }))
)
