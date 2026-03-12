import React, { useState } from 'react'
import PropsPanel from '@/panels/props/PropsPanel'
import BindingsPanel from '@/panels/bindings/BindingsPanel'
import EventsPanel from '@/panels/props/EventsPanel'
import { cn } from '@/utils/cn'

type Tab = 'props' | 'events'

export default function RightSidebar() {
  const [tab, setTab] = useState<Tab>('props')
  const [bindingsProp, setBindingsProp] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full bg-editor-panel border-l border-editor-border overflow-hidden">
      {/* Tab bar — hidden when bindings panel is open */}
      {!bindingsProp && (
        <div className="flex border-b border-editor-border flex-shrink-0">
          {(['props', 'events'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-1.5 text-xs capitalize border-b-2 transition-colors',
                tab === t
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-editor-muted hover:text-editor-text'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {bindingsProp ? (
          <BindingsPanel
            targetProp={bindingsProp}
            onClose={() => setBindingsProp(null)}
          />
        ) : tab === 'props' ? (
          <PropsPanel onOpenBindings={setBindingsProp} />
        ) : (
          <EventsPanel />
        )}
      </div>
    </div>
  )
}
