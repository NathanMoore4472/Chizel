import React from 'react'
import type { EnumPropSchema } from '@/types'

interface Props {
  schema: EnumPropSchema
  value: unknown
  onChange: (value: unknown) => void
}

export default function EnumField({ schema, value, onChange }: Props) {
  const str = typeof value === 'string' ? value : ''
  return (
    <select
      value={str}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text focus:outline-none focus:border-blue-500"
    >
      {schema.options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
