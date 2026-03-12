import React, { Suspense, lazy } from 'react'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function ExpressionEditor({ value, onChange, placeholder }: Props) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-20 text-xs text-editor-muted">
        Loading editor...
      </div>
    }>
      <MonacoEditor
        height="120px"
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={v => onChange(v ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          lineNumbers: 'off',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 4, bottom: 4 },
          folding: false,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          placeholder: placeholder,
        }}
      />
    </Suspense>
  )
}
