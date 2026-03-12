import type { ComponentNode, CustomPropDef } from './component-node'
import type { Binding } from './binding'
import type { DataSource, DataSourceState } from './data-source'

export interface HistoryEntry {
  tree: ComponentNode[]
  timestamp: number
}

export interface EditorState {
  // Tree
  tree: ComponentNode[]
  addNode: (node: ComponentNode, parentId: string | null, x?: number, y?: number) => void
  removeNode: (id: string) => void
  moveNode: (nodeId: string, newParentId: string | null, newIndex: number) => void
  updateNodeProps: (id: string, props: Record<string, unknown>) => void
  updateNodeStyle: (id: string, style: ComponentNode['style']) => void
  updateNodeLabel: (id: string, label: string) => void
  setNodeVisible: (id: string, visible: boolean) => void
  setNodeLocked: (id: string, locked: boolean) => void
  duplicateNode: (id: string) => void
  addCustomProp: (nodeId: string, def: CustomPropDef) => void
  removeCustomProp: (nodeId: string, propName: string) => void
  renameCustomProp: (nodeId: string, oldName: string, newName: string) => void

  // Selection
  selectedId: string | null
  selectNode: (id: string | null) => void

  // Bindings
  setBinding: (nodeId: string, propName: string, binding: Binding) => void
  removeBinding: (nodeId: string, propName: string) => void

  // Data sources
  dataSources: DataSource[]
  dataSourceStates: Record<string, DataSourceState>
  addDataSource: (ds: DataSource) => void
  removeDataSource: (name: string) => void
  updateDataSource: (name: string, ds: Partial<DataSource>) => void
  setDataSourceState: (name: string, state: Partial<DataSourceState>) => void

  // Clipboard
  clipboard: { node: ComponentNode; mode: 'copy' | 'cut' } | null
  copyNode: (id: string) => void
  cutNode: (id: string) => void
  pasteNode: (parentId: string) => void

  // Drag
  draggingId: string | null
  setDraggingId: (id: string | null) => void

  // History
  history: {
    past: HistoryEntry[]
    future: HistoryEntry[]
  }
  undo: () => void
  redo: () => void
  snapshot: () => void

  // UI state
  previewMode: boolean
  togglePreviewMode: () => void
  zoom: number
  setZoom: (zoom: number) => void

  // File
  currentFilePath: string | null
  setCurrentFilePath: (path: string | null) => void
  loadState: (state: Partial<Pick<EditorState, 'tree' | 'dataSources'>>) => void
}
