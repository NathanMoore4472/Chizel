import React, { useState } from 'react'
import PropsPanel from '@/panels/props/PropsPanel'
import BindingsPanel from '@/panels/bindings/BindingsPanel'

export default function RightSidebar() {
  const [bindingsProp, setBindingsProp] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full bg-editor-panel border-l border-editor-border overflow-hidden">
      {bindingsProp ? (
        <BindingsPanel
          targetProp={bindingsProp}
          onClose={() => setBindingsProp(null)}
        />
      ) : (
        <PropsPanel onOpenBindings={setBindingsProp} />
      )}
    </div>
  )
}
