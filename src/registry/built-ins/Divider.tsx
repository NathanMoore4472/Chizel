import React from 'react'
import { registerComponent } from '../index'
import { number, color, enumOf, string } from '../schema-helpers'

registerComponent({
  type: 'Divider',
  label: 'Divider',
  category: 'Basic',
  description: 'Horizontal or vertical divider line',
  propSchema: {
    orientation: enumOf(
      [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
      { label: 'Orientation', defaultValue: 'horizontal' }
    ),
    color: color({ label: 'Color', defaultValue: '#3c3c3c' }),
    thickness: number({ label: 'Thickness', min: 1, max: 16, step: 1, defaultValue: 1 }),
    margin: number({ label: 'Margin', min: 0, max: 64, step: 1, defaultValue: 8 }),
    label: string({ label: 'Label', defaultValue: '' }),
  },
  defaultProps: {
    orientation: 'horizontal',
    color: '#3c3c3c',
    thickness: 1,
    margin: 8,
    label: '',
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { orientation, color, thickness, margin, label } = resolvedProps as {
      orientation: string
      color: string
      thickness: number
      margin: number
      label: string
    }

    if (orientation === 'vertical') {
      return (
        <div
          style={{
            display: 'inline-block',
            width: thickness,
            alignSelf: 'stretch',
            background: color,
            margin: `0 ${margin}px`,
          }}
        />
      )
    }

    if (label) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', margin: `${margin}px 0`, gap: 8 }}>
          <div style={{ flex: 1, height: thickness, background: color }} />
          <span style={{ fontSize: 11, color: '#858585', whiteSpace: 'nowrap' }}>{label}</span>
          <div style={{ flex: 1, height: thickness, background: color }} />
        </div>
      )
    }

    return (
      <hr
        style={{
          border: 'none',
          borderTop: `${thickness}px solid ${color}`,
          margin: `${margin}px 0`,
        }}
      />
    )
  },
})
