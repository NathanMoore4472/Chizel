import React from 'react'
import type { BooleanPropSchema } from '@/types'

interface Props {
  schema: BooleanPropSchema
  value: unknown
  onChange: (value: unknown) => void
}

export default function BooleanField({ schema: _schema, value, onChange }: Props) {
  const bool = Boolean(value)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={bool}
      onClick={() => onChange(!bool)}
      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
        bool ? 'bg-blue-600' : 'bg-editor-border'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          bool ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
