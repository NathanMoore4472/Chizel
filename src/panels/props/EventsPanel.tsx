import React, { useState } from 'react'
import { useEditorStore } from '@/store'
import { useSelectedNode } from '@/hooks/useSelectedNode'
import { getComponent } from '@/registry'
import { Zap, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

const COMMON_EVENTS = ['onClick', 'onMouseEnter', 'onMouseLeave', 'onChange', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp']

export default function EventsPanel() {
  const node = useSelectedNode()
  const setEvent = useEditorStore(s => s.setEvent)
  const removeEvent = useEditorStore(s => s.removeEvent)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [customName, setCustomName] = useState('')

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-editor-muted">
        Select a component to add events
      </div>
    )
  }

  const def = getComponent(node.type)
  const suggestedEvents = [
    ...(def?.supportedEvents ?? []),
    ...COMMON_EVENTS.filter(e => !def?.supportedEvents?.includes(e)),
  ]

  const activeEvents = Object.entries(node.events ?? {})

  const handleAdd = (name: string) => {
    if (!name.trim()) return
    setEvent(node.id, name.trim(), '')
    setExpanded(v => ({ ...v, [name.trim()]: true }))
    setShowAdd(false)
    setNewEventName('')
    setCustomName('')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-editor-border flex-shrink-0">
        <Zap size={11} className="text-yellow-400" />
        <span className="text-xs font-semibold text-editor-muted uppercase tracking-wider">Events</span>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="ml-auto p-0.5 rounded hover:bg-editor-hover text-editor-muted hover:text-editor-text"
          title="Add event handler"
        >
          <Plus size={11} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Add event picker */}
        {showAdd && (
          <div className="p-2 border-b border-editor-border bg-editor-active space-y-1.5">
            <div className="text-[10px] text-editor-muted uppercase tracking-wider">Select event</div>
            <div className="space-y-0.5">
              {suggestedEvents.filter(e => !node.events?.[e]).map(e => (
                <button
                  key={e}
                  onClick={() => handleAdd(e)}
                  className="w-full text-left px-2 py-1 rounded text-xs font-mono text-editor-text hover:bg-editor-hover"
                >
                  {e}
                  {def?.supportedEvents?.includes(e) && (
                    <span className="ml-1.5 text-[9px] text-blue-400">recommended</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-1 pt-1 border-t border-editor-border">
              <input
                type="text"
                placeholder="Custom event name..."
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd(customName)}
                className="flex-1 bg-editor-panel border border-editor-border rounded px-2 py-1 text-xs font-mono text-editor-text focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleAdd(customName)}
                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >Add</button>
            </div>
          </div>
        )}

        {/* Active event handlers */}
        {activeEvents.length === 0 && !showAdd && (
          <div className="px-3 py-4 text-xs text-editor-muted italic">No event handlers. Click + to add one.</div>
        )}

        {activeEvents.map(([eventName, code]) => (
          <div key={eventName} className="border-b border-editor-border/50">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-editor-hover cursor-pointer group"
              onClick={() => setExpanded(v => ({ ...v, [eventName]: !v[eventName] }))}
            >
              {expanded[eventName] ? <ChevronDown size={10} className="text-editor-muted" /> : <ChevronRight size={10} className="text-editor-muted" />}
              <span className="flex-1 text-xs font-mono text-yellow-400">{eventName}</span>
              {code && <span className="text-[9px] text-green-400">●</span>}
              <button
                onClick={e => { e.stopPropagation(); removeEvent(node.id, eventName) }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-editor-muted hover:text-red-400"
              >
                <Trash2 size={10} />
              </button>
            </div>

            {expanded[eventName] && (
              <div className="px-2 pb-2">
                <div className="text-[10px] text-editor-muted mb-1 px-1">
                  JS code — use <code className="bg-editor-active px-0.5 rounded">ctx</code> and <code className="bg-editor-active px-0.5 rounded">event</code>
                </div>
                <textarea
                  value={code}
                  onChange={e => setEvent(node.id, eventName, e.target.value)}
                  placeholder={`// e.g.\nconsole.log('clicked', ctx.props.label)\nalert(ctx.node.id)`}
                  rows={4}
                  spellCheck={false}
                  className="w-full bg-editor-active border border-editor-border rounded px-2 py-1.5 text-xs font-mono text-editor-text focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
