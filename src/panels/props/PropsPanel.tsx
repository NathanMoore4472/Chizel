import React, { useState } from 'react'
import { useEditorStore } from '@/store'
import { useSelectedNode } from '@/hooks/useSelectedNode'
import { getComponent } from '@/registry'
import PropField from './PropField'
import EmbeddedViewParams from './EmbeddedViewParams'
import { Settings, Plus, Trash2, Paintbrush } from 'lucide-react'
import type { CustomPropType } from '@/types'

interface Props {
  onOpenBindings: (propName: string) => void
}

export default function PropsPanel({ onOpenBindings }: Props) {
  const node = useSelectedNode()
  const updateNodeProps = useEditorStore(s => s.updateNodeProps)
  const updateNodeLabel = useEditorStore(s => s.updateNodeLabel)
  const addCustomProp = useEditorStore(s => s.addCustomProp)
  const removeCustomProp = useEditorStore(s => s.removeCustomProp)
  const setNodeExtraClasses = useEditorStore(s => s.setNodeExtraClasses)
  const setNodeCustomCss = useEditorStore(s => s.setNodeCustomCss)

  const [newPropName, setNewPropName] = useState('')
  const [newPropType, setNewPropType] = useState<CustomPropType>('string')
  const [showAdd, setShowAdd] = useState(false)
  const [nameError, setNameError] = useState('')

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-editor-muted">
        Select a component to edit properties
      </div>
    )
  }

  const def = getComponent(node.type)

  const handleAddCustomProp = () => {
    const name = newPropName.trim()
    if (!name) { setNameError('Name required'); return }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) { setNameError('Must be a valid identifier'); return }
    if (def?.propSchema[name] || node.customProps.some(p => p.name === name)) {
      setNameError('Name already in use'); return
    }
    addCustomProp(node.id, { name, type: newPropType })
    setNewPropName('')
    setNewPropType('string')
    setShowAdd(false)
    setNameError('')
  }

  const schemaPropNames = new Set(Object.keys(def?.propSchema ?? {}))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-editor-border flex-shrink-0">
        <Settings size={11} className="text-editor-muted" />
        <span className="text-xs font-semibold text-editor-muted uppercase tracking-wider">
          Properties
        </span>
        <span className="ml-auto text-xs text-blue-400 font-mono">{node.type}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1">
        {/* Label */}
        <div className="mb-2 pb-2 border-b border-editor-border/50">
          <div className="text-[10px] text-editor-muted uppercase tracking-wider mb-1">Label</div>
          <input
            type="text"
            value={node.label ?? ''}
            placeholder={node.type}
            onChange={e => updateNodeLabel(node.id, e.target.value)}
            className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Schema-defined props */}
        {def && Object.entries(def.propSchema).map(([propName, schema]) => (
          <PropField
            key={propName}
            propName={propName}
            schema={schema}
            value={node.props[propName] ?? schema.defaultValue}
            binding={node.bindings[propName]}
            onChange={newValue => updateNodeProps(node.id, { [propName]: newValue })}
            onBindingClick={() => onOpenBindings(propName)}
          />
        ))}

        {/* Discovered params for EmbeddedView */}
        {node.type === 'EmbeddedView' && <EmbeddedViewParams node={node} />}

        {/* Style overrides */}
        <div className="mt-3 pt-2 border-t border-editor-border/50">
          <div className="flex items-center gap-1 mb-2">
            <Paintbrush size={10} className="text-editor-muted" />
            <span className="text-[10px] font-semibold text-editor-muted uppercase tracking-wider">Style</span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-editor-muted block mb-1">Extra Classes</label>
              <input
                type="text"
                value={node.extraClasses ?? ''}
                onChange={e => setNodeExtraClasses(node.id, e.target.value)}
                placeholder="e.g. shadow-lg rounded-xl"
                className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-editor-muted block mb-1">Custom CSS</label>
              <textarea
                value={node.customCss ?? ''}
                onChange={e => setNodeCustomCss(node.id, e.target.value)}
                placeholder={'color: red;\nborder: 1px solid blue;\nopacity: 0.8;'}
                rows={4}
                spellCheck={false}
                className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono resize-none focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Custom props */}
        <div className="mt-3 pt-2 border-t border-editor-border/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-editor-muted uppercase tracking-wider">
              Custom Props
            </span>
            <button
              onClick={() => { setShowAdd(v => !v); setNameError('') }}
              className="p-0.5 rounded hover:bg-editor-hover text-editor-muted hover:text-editor-text"
              title="Add custom prop"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="mb-2 p-2 rounded bg-editor-active border border-editor-border space-y-1.5">
              <input
                autoFocus
                type="text"
                placeholder="propName"
                value={newPropName}
                onChange={e => { setNewPropName(e.target.value); setNameError('') }}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomProp()}
                className="w-full bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
              />
              {nameError && (
                <div className="text-[10px] text-red-400">{nameError}</div>
              )}
              <div className="flex gap-1">
                {(['string', 'number', 'boolean'] as CustomPropType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setNewPropType(t)}
                    className={`flex-1 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                      newPropType === t
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-editor-panel border-editor-border text-editor-muted hover:text-editor-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddCustomProp}
                className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
              >
                Add
              </button>
            </div>
          )}

          {/* Custom prop list */}
          {node.customProps.map(cp => (
            <div key={cp.name} className="group flex items-start gap-1">
              <div className="flex-1 min-w-0">
                <PropField
                  propName={cp.name}
                  schema={
                    cp.type === 'number'
                      ? { kind: 'number', label: cp.name }
                      : cp.type === 'boolean'
                      ? { kind: 'boolean', label: cp.name }
                      : { kind: 'string', label: cp.name }
                  }
                  value={node.props[cp.name] ?? (cp.type === 'number' ? 0 : cp.type === 'boolean' ? false : '')}
                  binding={node.bindings[cp.name]}
                  onChange={v => updateNodeProps(node.id, { [cp.name]: v })}
                  onBindingClick={() => onOpenBindings(cp.name)}
                  customBadge={<span className="text-[9px] text-editor-muted font-mono ml-0.5 opacity-60">{cp.type}</span>}
                />
              </div>
              <button
                onClick={() => removeCustomProp(node.id, cp.name)}
                className="mt-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded text-editor-muted hover:text-red-400 flex-shrink-0"
                title={`Remove ${cp.name}`}
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}

          {node.customProps.length === 0 && !showAdd && (
            <div className="text-[10px] text-editor-muted italic py-1">None</div>
          )}
        </div>
      </div>
    </div>
  )
}
