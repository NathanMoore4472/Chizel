import React, { useState } from 'react'
import { useEditorStore } from '@/store'
import type { DataSourceBinding, DatabaseDataSource, RestDataSource } from '@/types'
import { Plus, Trash2, Database, Globe, CheckCircle, XCircle, Loader, Pencil } from 'lucide-react'
import { testDatabaseConnection, closeDatabaseConnection } from '@/engine/data-source-runner'
import { isTauri } from '@/utils/file-ops'

interface Props {
  propName: string
  nodeId: string
  currentBinding?: DataSourceBinding
  onSave: (binding: DataSourceBinding) => void
  onRemove: () => void
}

type FormKind = 'rest' | 'database'
type FormMode = 'add' | 'edit'

const EMPTY_REST = {
  name: '', url: '', method: 'GET' as RestDataSource['method'],
  headers: '', body: '', poll: 0,
}
const EMPTY_DB = {
  name: '', connectionUrl: '', query: 'SELECT * FROM table_name LIMIT 100', poll: 0,
}

export default function DataSourcePicker({ propName, nodeId: _nodeId, currentBinding, onSave, onRemove }: Props) {
  const dataSources = useEditorStore(s => s.dataSources)
  const dataSourceStates = useEditorStore(s => s.dataSourceStates)
  const addDataSource = useEditorStore(s => s.addDataSource)
  const updateDataSource = useEditorStore(s => s.updateDataSource)
  const removeDataSource = useEditorStore(s => s.removeDataSource)

  const [selectedSource, setSelectedSource] = useState(currentBinding?.sourceName ?? '')
  const [path, setPath] = useState(currentBinding?.path ?? '$')

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('add')
  const [formKind, setFormKind] = useState<FormKind>('rest')
  const [editingName, setEditingName] = useState('')   // original name when editing

  // REST fields
  const [rName, setRName] = useState('')
  const [rUrl, setRUrl] = useState('')
  const [rMethod, setRMethod] = useState<RestDataSource['method']>('GET')
  const [rHeaders, setRHeaders] = useState('')
  const [rBody, setRBody] = useState('')
  const [rPoll, setRPoll] = useState(0)

  // Database fields
  const [dbName, setDbName] = useState('')
  const [dbUrl, setDbUrl] = useState('')
  const [dbQuery, setDbQuery] = useState('SELECT * FROM table_name LIMIT 100')
  const [dbPoll, setDbPoll] = useState(0)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  const openAdd = () => {
    setFormMode('add')
    setFormKind('rest')
    setEditingName('')
    setRName(''); setRUrl(''); setRMethod('GET'); setRHeaders(''); setRBody(''); setRPoll(0)
    setDbName(''); setDbUrl(''); setDbQuery('SELECT * FROM table_name LIMIT 100'); setDbPoll(0)
    setTestStatus('idle'); setTestMessage('')
    setFormOpen(true)
  }

  const openEdit = (name: string) => {
    const ds = dataSources.find(d => d.name === name)
    if (!ds) return
    setFormMode('edit')
    setEditingName(name)
    setTestStatus('idle'); setTestMessage('')
    if (ds.kind === 'rest') {
      setFormKind('rest')
      setRName(ds.name)
      setRUrl(ds.url)
      setRMethod(ds.method)
      setRHeaders(ds.headers ? JSON.stringify(ds.headers, null, 2) : '')
      setRBody(ds.body ?? '')
      setRPoll(ds.pollInterval ?? 0)
    } else if (ds.kind === 'database') {
      setFormKind('database')
      setDbName(ds.name)
      setDbUrl(ds.connectionUrl)
      setDbQuery(ds.query)
      setDbPoll(ds.pollInterval ?? 0)
    }
    setFormOpen(true)
  }

  const closeForm = () => setFormOpen(false)

  const handleSubmitRest = () => {
    if (!rName.trim()) return
    let headers: Record<string, string> | undefined
    if (rHeaders.trim()) {
      try { headers = JSON.parse(rHeaders) } catch { /* ignore */ }
    }
    const ds: RestDataSource = {
      kind: 'rest',
      name: rName.trim(),
      url: rUrl.trim(),
      method: rMethod,
      headers,
      body: rBody.trim() || undefined,
      pollInterval: rPoll > 0 ? rPoll : undefined,
      enabled: true,
    }
    if (formMode === 'edit') {
      updateDataSource(editingName, ds)
      if (selectedSource === editingName) setSelectedSource(rName.trim())
    } else {
      addDataSource(ds)
      setSelectedSource(rName.trim())
    }
    closeForm()
  }

  const handleSubmitDatabase = () => {
    if (!dbName.trim() || !dbUrl.trim()) return
    const ds: DatabaseDataSource = {
      kind: 'database',
      name: dbName.trim(),
      connectionUrl: dbUrl.trim(),
      query: dbQuery.trim(),
      pollInterval: dbPoll > 0 ? dbPoll : undefined,
      enabled: true,
    }
    if (formMode === 'edit') {
      updateDataSource(editingName, ds)
      if (selectedSource === editingName) setSelectedSource(dbName.trim())
    } else {
      addDataSource(ds)
      setSelectedSource(dbName.trim())
    }
    closeForm()
  }

  const handleTestConnection = async () => {
    if (!dbUrl.trim()) return
    setTestStatus('testing'); setTestMessage('')
    try {
      const msg = await testDatabaseConnection(dbUrl.trim())
      setTestStatus('ok'); setTestMessage(msg)
    } catch (e) {
      setTestStatus('error'); setTestMessage(e instanceof Error ? e.message : String(e))
    }
  }

  const handleRemoveSource = () => {
    if (!selectedSource) return
    const ds = dataSources.find(d => d.name === selectedSource)
    if (ds?.kind === 'database') closeDatabaseConnection((ds as DatabaseDataSource).connectionUrl)
    removeDataSource(selectedSource)
    setSelectedSource('')
  }

  const selectedDs = dataSources.find(ds => ds.name === selectedSource)
  const inputCls = 'w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500'
  const textareaCls = `${inputCls} resize-none`

  return (
    <div className="space-y-3 p-2">

      {/* Source selector */}
      <div>
        <label className="text-xs text-editor-muted block mb-1">Data Source</label>
        <div className="flex gap-1">
          <select value={selectedSource} onChange={e => setSelectedSource(e.target.value)}
            className="flex-1 bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500">
            <option value="">-- Select source --</option>
            {dataSources.map(ds => (
              <option key={ds.name} value={ds.name}>
                {ds.kind === 'database' ? '🗄 ' : '🌐 '}{ds.name}
              </option>
            ))}
          </select>

          <button onClick={openAdd} className="p-1.5 rounded hover:bg-editor-hover text-editor-muted" title="Add source">
            <Plus size={12} />
          </button>
          {selectedSource && (
            <button onClick={() => openEdit(selectedSource)} className="p-1.5 rounded hover:bg-editor-hover text-editor-muted hover:text-editor-text" title="Edit source">
              <Pencil size={12} />
            </button>
          )}
          {selectedSource && (
            <button onClick={handleRemoveSource} className="p-1.5 rounded hover:bg-red-900/30 text-editor-muted hover:text-red-400" title="Remove source">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit form */}
      {formOpen && (
        <div className="border border-editor-border rounded p-2 space-y-2 bg-editor-active">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-editor-muted">
              {formMode === 'edit' ? `Edit: ${editingName}` : 'New Data Source'}
            </span>
            <button onClick={closeForm} className="text-editor-muted hover:text-editor-text text-xs">✕</button>
          </div>

          {/* Kind toggle — locked when editing */}
          {formMode === 'add' && (
            <div className="flex gap-1">
              {(['rest', 'database'] as FormKind[]).map(k => (
                <button key={k} onClick={() => setFormKind(k)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                    formKind === k ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-editor-panel border-editor-border text-editor-muted hover:text-editor-text'
                  }`}>
                  {k === 'rest' ? <Globe size={10} /> : <Database size={10} />}
                  {k === 'rest' ? 'REST' : 'Database'}
                </button>
              ))}
            </div>
          )}

          {/* REST form */}
          {formKind === 'rest' && (
            <>
              <input placeholder="Name" value={rName} onChange={e => setRName(e.target.value)}
                className={inputCls} />
              <div className="flex gap-1">
                <select value={rMethod} onChange={e => setRMethod(e.target.value as RestDataSource['method'])}
                  className="bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500">
                  {(['GET','POST','PUT','PATCH','DELETE'] as const).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input placeholder="https://api.example.com/data" value={rUrl} onChange={e => setRUrl(e.target.value)}
                  spellCheck={false} autoCorrect="off" className="flex-1 bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <div className="text-[10px] text-editor-muted mb-0.5">Headers (JSON)</div>
                <textarea placeholder={'{"Authorization": "Bearer token"}'} value={rHeaders}
                  onChange={e => setRHeaders(e.target.value)} rows={2} spellCheck={false} autoCorrect="off" className={textareaCls} />
              </div>
              {rMethod !== 'GET' && (
                <div>
                  <div className="text-[10px] text-editor-muted mb-0.5">Body (JSON)</div>
                  <textarea placeholder={'{"key": "value"}'} value={rBody}
                    onChange={e => setRBody(e.target.value)} rows={3} spellCheck={false} autoCorrect="off" className={textareaCls} />
                </div>
              )}
              <div className="flex gap-2 items-center">
                <label className="text-[10px] text-editor-muted">Poll (ms)</label>
                <input type="number" min={0} step={1000} value={rPoll} onChange={e => setRPoll(Number(e.target.value))}
                  placeholder="0 = once" className="w-24 bg-editor-panel border border-editor-border rounded px-2 py-0.5 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
              </div>
              <button onClick={handleSubmitRest} disabled={!rName.trim()}
                className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium">
                {formMode === 'edit' ? 'Save Changes' : 'Add REST Source'}
              </button>
            </>
          )}

          {/* Database form */}
          {formKind === 'database' && (
            <>
              {!isTauri() && (
                <div className="text-[10px] text-yellow-400 bg-yellow-400/10 rounded px-2 py-1">
                  Database sources require the desktop (Tauri) app
                </div>
              )}
              <input placeholder="Name" value={dbName} onChange={e => setDbName(e.target.value)}
                spellCheck={false} autoCorrect="off" className={inputCls} />
              <div className="flex gap-1">
                <input placeholder="sqlite:///path/to/db.sqlite  or  postgres://user:pass@host/db"
                  value={dbUrl} onChange={e => { setDbUrl(e.target.value); setTestStatus('idle') }}
                  spellCheck={false} autoCorrect="off"
                  className="flex-1 bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
                <button onClick={handleTestConnection} disabled={testStatus === 'testing' || !dbUrl.trim()}
                  className="px-2 py-1 rounded bg-editor-hover border border-editor-border text-xs text-editor-text disabled:opacity-40 hover:bg-editor-active flex items-center gap-1">
                  {testStatus === 'testing' && <Loader size={10} className="animate-spin" />}
                  {testStatus === 'ok' && <CheckCircle size={10} className="text-green-400" />}
                  {testStatus === 'error' && <XCircle size={10} className="text-red-400" />}
                  {testStatus === 'idle' ? 'Test' : testStatus === 'testing' ? 'Testing…' : testStatus === 'ok' ? 'OK' : 'Failed'}
                </button>
              </div>
              {testMessage && (
                <div className={`text-[10px] rounded px-2 py-1 ${testStatus === 'ok' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {testMessage}
                </div>
              )}
              <div className="text-[10px] text-editor-muted">SQL Query</div>
              <textarea value={dbQuery} onChange={e => setDbQuery(e.target.value)} rows={3}
                spellCheck={false} autoCorrect="off" className={textareaCls} />
              <div className="flex gap-2 items-center">
                <label className="text-[10px] text-editor-muted">Poll (ms)</label>
                <input type="number" min={0} step={1000} value={dbPoll} onChange={e => setDbPoll(Number(e.target.value))}
                  placeholder="0 = once" className="w-24 bg-editor-panel border border-editor-border rounded px-2 py-0.5 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
              </div>
              <button onClick={handleSubmitDatabase} disabled={!dbName.trim() || !dbUrl.trim()}
                className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium">
                {formMode === 'edit' ? 'Save Changes' : 'Add Database Source'}
              </button>
            </>
          )}
        </div>
      )}

      {/* JSONPath — REST only */}
      {selectedDs?.kind === 'rest' && (
        <div>
          <label className="text-xs text-editor-muted block mb-1">JSONPath</label>
          <input value={path} onChange={e => setPath(e.target.value)} placeholder="$.data[0].name"
            spellCheck={false} autoCorrect="off"
            className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500" />
        </div>
      )}

      {selectedDs?.kind === 'database' && (
        <div className="text-[10px] text-editor-muted bg-editor-active rounded px-2 py-1 space-y-0.5">
          <div>Returns array of row objects.</div>
          <div><code className="bg-editor-panel px-0.5 rounded">ctx.sources.{selectedSource}[0]?.columnName</code></div>
          <div className="opacity-60">Debug: <code className="bg-editor-panel px-0.5 rounded">ctx.sourceStates.{selectedSource}.error</code></div>
        </div>
      )}

      {/* Live fetch status */}
      {selectedSource && dataSourceStates[selectedSource] && (() => {
        const s = dataSourceStates[selectedSource]
        if (s.loading) return <div className="text-[10px] text-blue-400">Fetching…</div>
        if (s.error) return <div className="text-[10px] text-red-400 bg-red-400/10 rounded px-2 py-1">Error: {s.error}</div>
        if (s.lastFetched) return <div className="text-[10px] text-green-400">✓ {Array.isArray(s.data) ? `${(s.data as unknown[]).length} rows` : 'Loaded'}</div>
        return <div className="text-[10px] text-editor-muted">Not yet fetched</div>
      })()}

      <div className="flex gap-1.5">
        <button onClick={() => onSave({ kind: 'data-source', propName, sourceName: selectedSource, path })}
          disabled={!selectedSource}
          className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium">
          Apply
        </button>
        {currentBinding && (
          <button onClick={onRemove} className="p-1.5 rounded hover:bg-red-900/50 text-red-400" title="Remove binding">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
