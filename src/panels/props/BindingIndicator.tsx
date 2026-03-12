import React from 'react'
import { Zap } from 'lucide-react'
import type { Binding } from '@/types'

interface Props {
  binding?: Binding
  onClick: () => void
}

export default function BindingIndicator({ binding, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title={binding ? `Bound: ${binding.kind}` : 'Add binding'}
      className={`p-0.5 rounded flex-shrink-0 transition-colors ${
        binding
          ? 'text-yellow-400 hover:text-yellow-300'
          : 'text-editor-muted hover:text-editor-text'
      }`}
    >
      <Zap size={10} fill={binding ? 'currentColor' : 'none'} />
    </button>
  )
}
