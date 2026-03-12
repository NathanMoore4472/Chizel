import React from 'react'
import { registerComponent } from '../index'
import { string, number, boolean, color, enumOf } from '../schema-helpers'

registerComponent({
  type: 'Container',
  label: 'Container',
  category: 'Layout',
  description: 'Generic container / div',
  propSchema: {
    padding: number({ label: 'Padding', min: 0, max: 100, step: 1, defaultValue: 8 }),
    background: color({ label: 'Background', defaultValue: 'transparent' }),
    borderRadius: number({ label: 'Border Radius', min: 0, max: 50, step: 1, defaultValue: 0 }),
    border: string({ label: 'Border', defaultValue: 'none' }),
    fullWidth: boolean({ label: 'Full Width', defaultValue: true }),
    fullHeight: boolean({ label: 'Full Height', defaultValue: false }),
  },
  defaultProps: {
    padding: 8,
    background: 'transparent',
    borderRadius: 0,
    border: 'none',
    fullWidth: true,
    fullHeight: false,
  },
  acceptsChildren: true,
  render: ({ resolvedProps, children }) => {
    const { padding, background, borderRadius, border, fullWidth, fullHeight } = resolvedProps as {
      padding: number
      background: string
      borderRadius: number
      border: string
      fullWidth: boolean
      fullHeight: boolean
    }
    return (
      <div
        style={{
          padding,
          background,
          borderRadius,
          border,
          width: fullWidth ? '100%' : undefined,
          height: fullHeight ? '100%' : undefined,
          minHeight: 32,
        }}
      >
        {children}
      </div>
    )
  },
})
