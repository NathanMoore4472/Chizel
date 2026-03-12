import React from 'react'
import { registerComponent } from '../index'
import { number, string } from '../schema-helpers'

registerComponent({
  type: 'Grid',
  label: 'Grid',
  category: 'Layout',
  description: 'CSS Grid layout container',
  propSchema: {
    columns: number({ label: 'Columns', min: 1, max: 12, step: 1, defaultValue: 3 }),
    gap: number({ label: 'Gap', min: 0, max: 100, step: 1, defaultValue: 8 }),
    padding: number({ label: 'Padding', min: 0, max: 100, step: 1, defaultValue: 0 }),
    templateColumns: string({ label: 'Template Columns', defaultValue: '' }),
  },
  defaultProps: {
    columns: 3,
    gap: 8,
    padding: 0,
    templateColumns: '',
  },
  acceptsChildren: true,
  render: ({ resolvedProps, children }) => {
    const { columns, gap, padding, templateColumns } = resolvedProps as {
      columns: number
      gap: number
      padding: number
      templateColumns: string
    }
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: templateColumns || `repeat(${columns}, 1fr)`,
          gap,
          padding,
          minHeight: 32,
        }}
      >
        {children}
      </div>
    )
  },
})
