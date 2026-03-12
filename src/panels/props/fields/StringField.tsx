import React from 'react'
import type { StringPropSchema } from '@/types'

interface Props {
  schema: StringPropSchema
  value: unknown
  onChange: (value: unknown) => void
}

export default function StringField({ schema, value, onChange }: Props) {
  const str = typeof value === 'string' ? value : ''
  if (schema.multiline) {
    return (
      <textarea
        value={str}
        onChange={e => onChange(e.target.value)}
        placeholder={schema.placeholder}
        rows={3}
        className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono resize-none focus:outline-none focus:border-blue-500"
      />
    )
  }
  return (
    <input
      type="text"
      value={str}
      onChange={e => onChange(e.target.value)}
      placeholder={schema.placeholder}
      className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
    />
  )
}
