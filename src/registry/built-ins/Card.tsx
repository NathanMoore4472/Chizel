import React from 'react'
import { registerComponent } from '../index'
import { number, color, string, boolean } from '../schema-helpers'

registerComponent({
  type: 'Card',
  label: 'Card',
  category: 'Layout',
  description: 'Bordered card container with optional header',
  propSchema: {
    title: string({ label: 'Title', defaultValue: '' }),
    padding: number({ label: 'Padding', min: 0, max: 80, step: 1, defaultValue: 16 }),
    background: color({ label: 'Background', defaultValue: '#252526' }),
    borderColor: color({ label: 'Border Color', defaultValue: '#3c3c3c' }),
    borderRadius: number({ label: 'Border Radius', min: 0, max: 32, step: 1, defaultValue: 6 }),
    shadow: boolean({ label: 'Shadow', defaultValue: false }),
    fullWidth: boolean({ label: 'Full Width', defaultValue: false }),
  },
  defaultProps: {
    title: '',
    padding: 16,
    background: '#252526',
    borderColor: '#3c3c3c',
    borderRadius: 6,
    shadow: false,
    fullWidth: false,
  },
  acceptsChildren: true,
  render: ({ resolvedProps, children }) => {
    const { title, padding, background, borderColor, borderRadius, shadow, fullWidth } = resolvedProps as {
      title: string
      padding: number
      background: string
      borderColor: string
      borderRadius: number
      shadow: boolean
      fullWidth: boolean
    }
    return (
      <div
        style={{
          background,
          border: `1px solid ${borderColor}`,
          borderRadius,
          boxShadow: shadow ? '0 4px 16px rgba(0,0,0,0.4)' : undefined,
          width: fullWidth ? '100%' : undefined,
          overflow: 'hidden',
        }}
      >
        {title && (
          <div
            style={{
              padding: `8px ${padding}px`,
              borderBottom: `1px solid ${borderColor}`,
              fontSize: 13,
              fontWeight: 600,
              color: '#cccccc',
            }}
          >
            {title}
          </div>
        )}
        <div style={{ padding }}>{children}</div>
      </div>
    )
  },
})
