import React from 'react'
import type { PropSchema, Binding } from '@/types'
import StringField from './fields/StringField'
import NumberField from './fields/NumberField'
import BooleanField from './fields/BooleanField'
import ColorField from './fields/ColorField'
import EnumField from './fields/EnumField'
import BindingIndicator from './BindingIndicator'

interface Props {
  propName: string
  schema: PropSchema
  value: unknown
  binding?: Binding
  onChange: (value: unknown) => void
  onBindingClick: () => void
}

export default function PropField({ propName, schema, value, binding, onChange, onBindingClick }: Props) {
  const label = schema.label ?? propName

  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-editor-border/50 last:border-0">
      <div className="flex items-center gap-1">
        <span className="text-xs text-editor-muted flex-1 truncate" title={label}>
          {label}
        </span>
        <BindingIndicator binding={binding} onClick={onBindingClick} />
      </div>
      {binding ? (
        <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded font-mono truncate" title="Bound">
          {binding.kind === 'expression' ? `= ${binding.expression}` : `@ ${binding.sourceName}`}
        </div>
      ) : (
        <FieldEditor schema={schema} value={value} onChange={onChange} />
      )}
    </div>
  )
}

function FieldEditor({ schema, value, onChange }: {
  schema: PropSchema
  value: unknown
  onChange: (value: unknown) => void
}) {
  switch (schema.kind) {
    case 'string': return <StringField schema={schema} value={value} onChange={onChange} />
    case 'number': return <NumberField schema={schema} value={value} onChange={onChange} />
    case 'boolean': return <BooleanField schema={schema} value={value} onChange={onChange} />
    case 'color': return <ColorField schema={schema} value={value} onChange={onChange} />
    case 'enum': return <EnumField schema={schema} value={value} onChange={onChange} />
    default: return (
      <div className="text-xs text-editor-muted italic">Unsupported: {schema.kind}</div>
    )
  }
}
