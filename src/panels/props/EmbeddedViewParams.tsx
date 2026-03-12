import React, { useState, useEffect } from 'react'
import { useEditorStore } from '@/store'
import { loadViewFile, getViewParams } from '@/engine/view-loader'
import type { ComponentNode, CustomPropDef } from '@/types/component-node'
import StringField from './fields/StringField'
import NumberField from './fields/NumberField'
import BooleanField from './fields/BooleanField'
import JsonField from './fields/JsonField'
import { Link } from 'lucide-react'

interface Props {
  node: ComponentNode
}

export default function EmbeddedViewParams({ node }: Props) {
  const updateNodeProps = useEditorStore(s => s.updateNodeProps)
  const [params, setParams] = useState<CustomPropDef[]>([])
  const [error, setError] = useState<string | null>(null)

  const src = (node.props.src as string) ?? ''

  useEffect(() => {
    if (!src.trim()) { setParams([]); setError(null); return }
    loadViewFile(src)
      .then(view => { setParams(getViewParams(view)); setError(null) })
      .catch(e => { setError(e instanceof Error ? e.message : String(e)); setParams([]) })
  }, [src])

  if (!src.trim()) return null

  if (error) {
    return (
      <div className="mt-2 px-1 py-1.5 text-[10px] text-red-400 bg-red-900/20 rounded">
        Could not load params: {error}
      </div>
    )
  }

  if (params.length === 0) return null

  return (
    <div className="mt-3 pt-2 border-t border-editor-border/50">
      <div className="flex items-center gap-1 mb-1">
        <Link size={10} className="text-editor-muted" />
        <span className="text-[10px] font-semibold text-editor-muted uppercase tracking-wider">
          View Params
        </span>
      </div>
      {params.map(param => (
        <div key={param.name} className="flex flex-col gap-0.5 py-1.5 border-b border-editor-border/50 last:border-0">
          <span className="text-xs text-editor-muted">{param.name}</span>
          <FieldForType
            type={param.type}
            value={node.props[param.name]}
            onChange={v => updateNodeProps(node.id, { [param.name]: v })}
          />
        </div>
      ))}
    </div>
  )
}

function FieldForType({ type, value, onChange }: {
  type: CustomPropDef['type']
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (type === 'number') return (
    <NumberField schema={{ kind: 'number' }} value={value} onChange={onChange} />
  )
  if (type === 'boolean') return (
    <BooleanField schema={{ kind: 'boolean' }} value={value} onChange={onChange} />
  )
  if (type === 'array') return (
    <JsonField value={value ?? []} onChange={onChange} placeholder={'[\n  "item1"\n]'} rows={3} />
  )
  if (type === 'object') return (
    <JsonField value={value ?? {}} onChange={onChange} placeholder={'{\n  "key": "value"\n}'} rows={3} />
  )
  return (
    <StringField schema={{ kind: 'string' }} value={value} onChange={onChange} />
  )
}
