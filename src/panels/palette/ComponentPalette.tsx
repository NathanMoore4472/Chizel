import React, { useState } from 'react'
import { getAllComponents } from '@/registry'
import PaletteItem from './PaletteItem'
import { Search } from 'lucide-react'

export default function ComponentPalette() {
  const [search, setSearch] = useState('')
  const allComponents = getAllComponents()

  const filtered = allComponents.filter(def =>
    def.label.toLowerCase().includes(search.toLowerCase()) ||
    (def.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, def) => {
    const cat = def.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(def)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-1.5 border-b border-editor-border">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-editor-active border border-editor-border">
          <Search size={11} className="text-editor-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs text-editor-text placeholder:text-editor-muted outline-none min-w-0"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {Object.entries(byCategory).map(([category, defs]) => (
          <div key={category} className="mb-2">
            <div className="text-[10px] font-semibold text-editor-muted uppercase tracking-wider px-2 py-1">
              {category}
            </div>
            {defs.map(def => (
              <PaletteItem key={def.type} def={def} />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-xs text-editor-muted text-center py-4">No components found</div>
        )}
      </div>
    </div>
  )
}
