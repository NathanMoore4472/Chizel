import React, { useState } from 'react'
import { useEditorStore } from '@/store'
import type { DataSourceBinding } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  propName: string
  nodeId: string
  currentBinding?: DataSourceBinding
  onSave: (binding: DataSourceBinding) => void
  onRemove: () => void
}

export default function DataSourcePicker({ propName, nodeId: _nodeId, currentBinding, onSave, onRemove }: Props) {
  const dataSources = useEditorStore(s => s.dataSources)
  const addDataSource = useEditorStore(s => s.addDataSource)
  const removeDataSource = useEditorStore(s => s.removeDataSource)

  const [selectedSource, setSelectedSource] = useState(currentBinding?.sourceName ?? '')
  const [path, setPath] = useState(currentBinding?.path ?? '$')
  const [showNewSource, setShowNewSource] = useState(false)
  const [newSourceName, setNewSourceName] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')

  const handleSave = () => {
    if (!selectedSource) return
    onSave({
      kind: 'data-source',
      propName,
      sourceName: selectedSource,
      path,
    })
  }

  const handleAddSource = () => {
    if (!newSourceName.trim()) return
    addDataSource({
      kind: 'rest',
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      method: 'GET',
      enabled: true,
    })
    setSelectedSource(newSourceName.trim())
    setShowNewSource(false)
    setNewSourceName('')
    setNewSourceUrl('')
  }

  return (
    <div className="space-y-3 p-2">
      <div>
        <label className="text-xs text-editor-muted block mb-1">Data Source</label>
        <div className="flex gap-1">
          <select
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="flex-1 bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Select source --</option>
            {dataSources.map(ds => (
              <option key={ds.name} value={ds.name}>{ds.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowNewSource(v => !v)}
            className="p-1.5 rounded hover:bg-editor-hover text-editor-muted"
            title="Add data source"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {showNewSource && (
        <div className="border border-editor-border rounded p-2 space-y-1.5 bg-editor-active">
          <div className="text-xs text-editor-muted font-semibold">New Data Source</div>
          <input
            placeholder="Name"
            value={newSourceName}
            onChange={e => setNewSourceName(e.target.value)}
            className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500"
          />
          <input
            placeholder="URL (e.g. https://api.example.com/data)"
            value={newSourceUrl}
            onChange={e => setNewSourceUrl(e.target.value)}
            className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddSource}
            className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
          >
            Add
          </button>
        </div>
      )}

      <div>
        <label className="text-xs text-editor-muted block mb-1">JSONPath</label>
        <input
          value={path}
          onChange={e => setPath(e.target.value)}
          placeholder="$.data[0].name"
          className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={handleSave}
          disabled={!selectedSource}
          className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium"
        >
          Apply
        </button>
        {currentBinding && (
          <button
            onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-900/50 text-red-400"
            title="Remove binding"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
