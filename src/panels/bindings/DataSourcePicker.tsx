import React, { useState } from 'react'
import { useEditorStore } from '@/store'
import type { DataSourceBinding, DatabaseDataSource, RestDataSource } from '@/types'

import { Plus, Trash2, Database, Globe, CheckCircle, XCircle, Loader } from 'lucide-react'
import { testDatabaseConnection, closeDatabaseConnection } from '@/engine/data-source-runner'
import { isTauri } from '@/utils/file-ops'

interface Props {
  propName: string
  nodeId: string
  currentBinding?: DataSourceBinding
  onSave: (binding: DataSourceBinding) => void
  onRemove: () => void
}

type NewKind = 'rest' | 'database'

export default function DataSourcePicker({ propName, nodeId: _nodeId, currentBinding, onSave, onRemove }: Props) {
  const dataSources = useEditorStore(s => s.dataSources)
  const dataSourceStates = useEditorStore(s => s.dataSourceStates)
  const addDataSource = useEditorStore(s => s.addDataSource)
  const removeDataSource = useEditorStore(s => s.removeDataSource)

  const [selectedSource, setSelectedSource] = useState(currentBinding?.sourceName ?? '')
  const [path, setPath] = useState(currentBinding?.path ?? '$')
  const [showNewSource, setShowNewSource] = useState(false)
  const [newKind, setNewKind] = useState<NewKind>('rest')

  // REST fields
  const [newSourceName, setNewSourceName] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newSourceMethod, setNewSourceMethod] = useState<RestDataSource['method']>('GET')
  const [newSourceHeaders, setNewSourceHeaders] = useState('')
  const [newSourceBody, setNewSourceBody] = useState('')
  const [newSourcePoll, setNewSourcePoll] = useState(0)

  // Database fields
  const [dbName, setDbName] = useState('')
  const [dbConnectionUrl, setDbConnectionUrl] = useState('')
  const [dbQuery, setDbQuery] = useState('SELECT * FROM table_name LIMIT 100')
  const [dbPollInterval, setDbPollInterval] = useState(0)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  const handleSave = () => {
    if (!selectedSource) return
    onSave({ kind: 'data-source', propName, sourceName: selectedSource, path })
  }

  const handleAddRest = () => {
    if (!newSourceName.trim()) return
    let headers: Record<string, string> | undefined
    if (newSourceHeaders.trim()) {
      try { headers = JSON.parse(newSourceHeaders) } catch { /* ignore malformed */ }
    }
    addDataSource({
      kind: 'rest',
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      method: newSourceMethod,
      headers,
      body: newSourceBody.trim() || undefined,
      pollInterval: newSourcePoll > 0 ? newSourcePoll : undefined,
      enabled: true,
    })
    setSelectedSource(newSourceName.trim())
    setShowNewSource(false)
    setNewSourceName('')
    setNewSourceUrl('')
    setNewSourceMethod('GET')
    setNewSourceHeaders('')
    setNewSourceBody('')
    setNewSourcePoll(0)
  }

  const handleAddDatabase = () => {
    if (!dbName.trim() || !dbConnectionUrl.trim()) return
    addDataSource({
      kind: 'database',
      name: dbName.trim(),
      connectionUrl: dbConnectionUrl.trim(),
      query: dbQuery.trim(),
      pollInterval: dbPollInterval > 0 ? dbPollInterval : undefined,
      enabled: true,
    })
    setSelectedSource(dbName.trim())
    setShowNewSource(false)
    setDbName('')
    setDbConnectionUrl('')
    setDbQuery('SELECT * FROM table_name LIMIT 100')
    setTestStatus('idle')
  }

  const handleTestConnection = async () => {
    if (!dbConnectionUrl.trim()) return
    setTestStatus('testing')
    setTestMessage('')
    try {
      const msg = await testDatabaseConnection(dbConnectionUrl.trim())
      setTestStatus('ok')
      setTestMessage(msg)
    } catch (e) {
      setTestStatus('error')
      setTestMessage(e instanceof Error ? e.message : String(e))
    }
  }

  const selectedDs = dataSources.find(ds => ds.name === selectedSource)

  return (
    <div className="space-y-3 p-2">
      {/* Source selector */}
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
              <option key={ds.name} value={ds.name}>
                {ds.kind === 'database' ? '🗄 ' : '🌐 '}{ds.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowNewSource(v => !v)}
            className="p-1.5 rounded hover:bg-editor-hover text-editor-muted"
            title="Add data source"
          >
            <Plus size={12} />
          </button>
          {selectedSource && (
            <button
              onClick={() => { closeDatabaseConnection(selectedDs?.kind === 'database' ? (selectedDs as DatabaseDataSource).connectionUrl : ''); removeDataSource(selectedSource); setSelectedSource('') }}
              className="p-1.5 rounded hover:bg-red-900/30 text-editor-muted hover:text-red-400"
              title="Remove source"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Add new source form */}
      {showNewSource && (
        <div className="border border-editor-border rounded p-2 space-y-2 bg-editor-active">
          <div className="flex items-center gap-1 text-xs font-semibold text-editor-muted">
            New Data Source
          </div>

          {/* Kind toggle */}
          <div className="flex gap-1">
            {(['rest', 'database'] as NewKind[]).map(k => (
              <button
                key={k}
                onClick={() => setNewKind(k)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                  newKind === k
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-editor-panel border-editor-border text-editor-muted hover:text-editor-text'
                }`}
              >
                {k === 'rest' ? <Globe size={10} /> : <Database size={10} />}
                {k === 'rest' ? 'REST' : 'Database'}
              </button>
            ))}
          </div>

          {newKind === 'rest' ? (
            <>
              <input placeholder="Name" value={newSourceName} onChange={e => setNewSourceName(e.target.value)}
                className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500" />

              <div className="flex gap-1">
                <select value={newSourceMethod} onChange={e => setNewSourceMethod(e.target.value as RestDataSource['method'])}
                  className="bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500">
                  {(['GET','POST','PUT','PATCH','DELETE'] as const).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input placeholder="https://api.example.com/data" value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)}
                  spellCheck={false} autoCorrect="off"
                  className="flex-1 bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <div className="text-[10px] text-editor-muted mb-0.5">Headers (JSON)</div>
                <textarea placeholder={'{"Authorization": "Bearer token"}'} value={newSourceHeaders}
                  onChange={e => setNewSourceHeaders(e.target.value)}
                  rows={2} spellCheck={false} autoCorrect="off"
                  className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono resize-none focus:outline-none focus:border-blue-500" />
              </div>

              {newSourceMethod !== 'GET' && (
                <div>
                  <div className="text-[10px] text-editor-muted mb-0.5">Body (JSON)</div>
                  <textarea placeholder={'{"key": "value"}'} value={newSourceBody}
                    onChange={e => setNewSourceBody(e.target.value)}
                    rows={3} spellCheck={false} autoCorrect="off"
                    className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono resize-none focus:outline-none focus:border-blue-500" />
                </div>
              )}

              <div className="flex gap-2 items-center">
                <label className="text-[10px] text-editor-muted">Poll (ms)</label>
                <input type="number" min={0} step={1000} value={newSourcePoll}
                  onChange={e => setNewSourcePoll(Number(e.target.value))}
                  placeholder="0 = once"
                  className="w-24 bg-editor-panel border border-editor-border rounded px-2 py-0.5 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
              </div>

              <button onClick={handleAddRest}
                className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                Add REST Source
              </button>
            </>
          ) : (
            <>
              {!isTauri() && (
                <div className="text-[10px] text-yellow-400 bg-yellow-400/10 rounded px-2 py-1">
                  Database sources require the desktop (Tauri) app
                </div>
              )}
              <input placeholder="Name" value={dbName} onChange={e => setDbName(e.target.value)}
                spellCheck={false} autoCorrect="off"
                className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
              <div className="flex gap-1">
                <input
                  placeholder="sqlite:///path/to/db.sqlite  or  postgres://user:pass@host/db"
                  value={dbConnectionUrl}
                  onChange={e => { setDbConnectionUrl(e.target.value); setTestStatus('idle') }}
                  spellCheck={false} autoCorrect="off"
                  className="flex-1 bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || !dbConnectionUrl.trim()}
                  className="px-2 py-1 rounded bg-editor-hover border border-editor-border text-xs text-editor-text disabled:opacity-40 hover:bg-editor-active flex items-center gap-1"
                  title="Test connection"
                >
                  {testStatus === 'testing' && <Loader size={10} className="animate-spin" />}
                  {testStatus === 'ok' && <CheckCircle size={10} className="text-green-400" />}
                  {testStatus === 'error' && <XCircle size={10} className="text-red-400" />}
                  {testStatus === 'idle' && 'Test'}
                  {testStatus === 'testing' && 'Testing…'}
                  {testStatus === 'ok' && 'OK'}
                  {testStatus === 'error' && 'Failed'}
                </button>
              </div>
              {testMessage && (
                <div className={`text-[10px] rounded px-2 py-1 ${testStatus === 'ok' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {testMessage}
                </div>
              )}
              <div className="text-[10px] text-editor-muted">SQL Query</div>
              <textarea
                value={dbQuery}
                onChange={e => setDbQuery(e.target.value)}
                rows={3}
                spellCheck={false} autoCorrect="off"
                className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono resize-none focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2 items-center">
                <label className="text-[10px] text-editor-muted">Poll (ms)</label>
                <input type="number" min={0} step={1000} value={dbPollInterval}
                  onChange={e => setDbPollInterval(Number(e.target.value))}
                  placeholder="0 = once"
                  className="w-24 bg-editor-panel border border-editor-border rounded px-2 py-0.5 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
              </div>
              <button onClick={handleAddDatabase} disabled={!dbName.trim() || !dbConnectionUrl.trim()}
                className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium">
                Add Database Source
              </button>
            </>
          )}
        </div>
      )}

      {/* JSONPath — only for REST; database sources return full row arrays */}
      {selectedDs?.kind === 'rest' && (
        <div>
          <label className="text-xs text-editor-muted block mb-1">JSONPath</label>
          <input value={path} onChange={e => setPath(e.target.value)}
            placeholder="$.data[0].name"
            spellCheck={false} autoCorrect="off"
            className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {selectedDs?.kind === 'database' && (
        <div className="text-[10px] text-editor-muted bg-editor-active rounded px-2 py-1 space-y-0.5">
          <div>Returns array of row objects.</div>
          <div><code className="bg-editor-panel px-0.5 rounded">ctx.sources.{selectedSource}[0]?.columnName</code></div>
          <div className="opacity-60">Debug: <code className="bg-editor-panel px-0.5 rounded">ctx.sourceStates.{selectedSource}.error</code></div>
        </div>
      )}

      {/* Show live status of selected source */}
      {selectedSource && dataSourceStates[selectedSource] && (() => {
        const s = dataSourceStates[selectedSource]
        if (s.loading) return <div className="text-[10px] text-blue-400">Fetching…</div>
        if (s.error) return <div className="text-[10px] text-red-400 bg-red-400/10 rounded px-2 py-1">Error: {s.error}</div>
        if (s.lastFetched) return <div className="text-[10px] text-green-400">✓ {Array.isArray(s.data) ? `${(s.data as unknown[]).length} rows` : 'Loaded'}</div>
        return <div className="text-[10px] text-editor-muted">Not yet fetched</div>
      })()}

      <div className="flex gap-1.5">
        <button onClick={handleSave} disabled={!selectedSource}
          className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium">
          Apply
        </button>
        {currentBinding && (
          <button onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-900/50 text-red-400" title="Remove binding">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
