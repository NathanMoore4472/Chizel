import React, { useState } from 'react'
import { useEditorStore } from '@/store'
import { useSelectedNode } from '@/hooks/useSelectedNode'
import { getComponent } from '@/registry'
import PropField from './PropField'
import { Settings } from 'lucide-react'

interface Props {
  onOpenBindings: (propName: string) => void
}

export default function PropsPanel({ onOpenBindings }: Props) {
  const node = useSelectedNode()
  const updateNodeProps = useEditorStore(s => s.updateNodeProps)

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-editor-muted">
        Select a component to edit properties
      </div>
    )
  }

  const def = getComponent(node.type)
  if (!def) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-editor-muted">
        Unknown component type: {node.type}
      </div>
    )
  }

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
        <div className="mb-2 pb-2 border-b border-editor-border/50">
          <div className="text-[10px] text-editor-muted uppercase tracking-wider mb-1">Label</div>
          <input
            type="text"
            value={node.label ?? ''}
            placeholder={node.type}
            onChange={e => {
              // Update label directly - need store action
            }}
            className="w-full bg-editor-active border border-editor-border rounded px-2 py-1 text-xs text-editor-text font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
        {Object.entries(def.propSchema).map(([propName, schema]) => (
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
      </div>
    </div>
  )
}
