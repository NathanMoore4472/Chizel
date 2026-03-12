import React, { useState } from 'react'
import { useEditorStore } from '@/store'
import { useSelectedNode } from '@/hooks/useSelectedNode'
import ExpressionEditor from './ExpressionEditor'
import DataSourcePicker from './DataSourcePicker'
import type { Binding, ExpressionBinding, DataSourceBinding } from '@/types'
import { Zap, Database } from 'lucide-react'

interface Props {
  targetProp: string | null
  onClose: () => void
}

export default function BindingsPanel({ targetProp, onClose }: Props) {
  const node = useSelectedNode()
  const setBinding = useEditorStore(s => s.setBinding)
  const removeBinding = useEditorStore(s => s.removeBinding)
  const [tab, setTab] = useState<'expression' | 'data-source'>('expression')
  const [expression, setExpression] = useState('')

  if (!node || !targetProp) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-editor-muted">
        Select a property to bind
      </div>
    )
  }

  const currentBinding = node.bindings[targetProp] as Binding | undefined

  // Initialize expression from current binding
  const currentExpr = currentBinding?.kind === 'expression' ? currentBinding.expression : expression

  const handleSaveExpression = () => {
    if (!expression && !currentExpr) return
    const binding: ExpressionBinding = {
      kind: 'expression',
      propName: targetProp,
      expression: expression || currentExpr,
    }
    setBinding(node.id, targetProp, binding)
  }

  const handleSaveDataSource = (binding: DataSourceBinding) => {
    setBinding(node.id, targetProp, binding)
  }

  const handleRemove = () => {
    removeBinding(node.id, targetProp)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-editor-border flex-shrink-0">
        <Zap size={11} className="text-yellow-400" />
        <span className="text-xs font-semibold text-editor-muted uppercase tracking-wider">
          Bindings
        </span>
        <span className="text-xs text-blue-400 font-mono ml-auto">{targetProp}</span>
        <button onClick={onClose} className="text-editor-muted hover:text-editor-text text-xs">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-editor-border flex-shrink-0">
        {(['expression', 'data-source'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-editor-muted hover:text-editor-text'
            }`}
          >
            {t === 'expression' ? <Zap size={10} /> : <Database size={10} />}
            {t === 'expression' ? 'Expression' : 'Data Source'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'expression' ? (
          <div className="p-2 space-y-2">
            <ExpressionEditor
              value={expression || (currentBinding?.kind === 'expression' ? currentBinding.expression : '')}
              onChange={setExpression}
              placeholder={`"Hello " + ctx.props.name`}
            />
            <div className="text-[10px] text-editor-muted bg-editor-active rounded p-1.5 font-mono space-y-0.5">
              <div>ctx.props • ctx.sources.name • ctx.parent.props • ctx.env.now</div>
              <div className="opacity-70">Single expression: no return needed</div>
              <div className="opacity-70">Multi-line (const/let/if): use explicit return</div>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleSaveExpression}
                className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
              >
                Apply
              </button>
              {currentBinding && (
                <button
                  onClick={handleRemove}
                  className="px-2 py-1 rounded hover:bg-red-900/50 text-red-400 text-xs"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <DataSourcePicker
            propName={targetProp}
            nodeId={node.id}
            currentBinding={currentBinding?.kind === 'data-source' ? currentBinding : undefined}
            onSave={handleSaveDataSource}
            onRemove={handleRemove}
          />
        )}
      </div>
    </div>
  )
}
