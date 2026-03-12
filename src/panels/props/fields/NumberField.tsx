import React from 'react'
import type { NumberPropSchema } from '@/types'

interface Props {
  schema: NumberPropSchema
  value: unknown
  onChange: (value: unknown) => void
}

export default function NumberField({ schema, value, onChange }: Props) {
  const num = typeof value === 'number' ? value : Number(value) || 0
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={num}
        min={schema.min}
        max={schema.max}
        step={schema.step ?? 1}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
      />
      {schema.min !== undefined && schema.max !== undefined && (
        <input
          type="range"
          value={num}
          min={schema.min}
          max={schema.max}
          step={schema.step ?? 1}
          onChange={e => onChange(Number(e.target.value))}
          className="w-16 accent-blue-500"
        />
      )}
    </div>
  )
}
