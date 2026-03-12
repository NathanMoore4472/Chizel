import React from 'react'
import type { ColorPropSchema } from '@/types'

interface Props {
  schema: ColorPropSchema
  value: unknown
  onChange: (value: unknown) => void
}

export default function ColorField({ schema: _schema, value, onChange }: Props) {
  const color = typeof value === 'string' ? value : '#000000'
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color === 'transparent' ? '#000000' : color}
        onChange={e => onChange(e.target.value)}
        className="h-6 w-8 rounded cursor-pointer border border-editor-border bg-transparent"
      />
      <input
        type="text"
        value={color}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}
