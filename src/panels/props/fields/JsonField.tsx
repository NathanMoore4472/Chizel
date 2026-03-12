import React, { useState, useEffect } from 'react'

interface Props {
  value: unknown
  onChange: (value: unknown) => void
  placeholder?: string
  rows?: number
}

export default function JsonField({ value, onChange, placeholder, rows = 4 }: Props) {
  const serialize = (v: unknown) => {
    try { return JSON.stringify(v, null, 2) } catch { return '' }
  }

  const [text, setText] = useState(() => serialize(value))
  const [error, setError] = useState<string | null>(null)

  // Sync when value changes externally (e.g. binding update)
  useEffect(() => {
    setText(serialize(value))
    setError(null)
  }, [value])

  const handleChange = (raw: string) => {
    setText(raw)
    try {
      const parsed = JSON.parse(raw)
      setError(null)
      onChange(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className={`w-full bg-editor-active border rounded px-2 py-1 text-xs text-editor-text font-mono resize-none focus:outline-none ${
          error ? 'border-red-500 focus:border-red-400' : 'border-editor-border focus:border-blue-500'
        }`}
      />
      {error && (
        <div className="text-[10px] text-red-400 mt-0.5 truncate" title={error}>{error}</div>
      )}
    </div>
  )
}
