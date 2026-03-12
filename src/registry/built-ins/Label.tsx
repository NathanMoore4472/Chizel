import React from 'react'
import { registerComponent } from '../index'
import { string, number, color, enumOf, boolean } from '../schema-helpers'

registerComponent({
  type: 'Label',
  label: 'Label',
  category: 'Basic',
  description: 'Form label or caption text',
  propSchema: {
    text: string({ label: 'Text', defaultValue: 'Label' }),
    fontSize: number({ label: 'Font Size', min: 8, max: 48, step: 1, defaultValue: 12 }),
    color: color({ label: 'Color', defaultValue: '#858585' }),
    fontWeight: enumOf(
      [
        { value: 'normal', label: 'Normal' },
        { value: '500', label: 'Medium' },
        { value: '600', label: 'Semibold' },
        { value: 'bold', label: 'Bold' },
      ],
      { label: 'Weight', defaultValue: 'normal' }
    ),
    uppercase: boolean({ label: 'Uppercase', defaultValue: false }),
    letterSpacing: number({ label: 'Letter Spacing', min: 0, max: 10, step: 0.5, defaultValue: 0 }),
  },
  defaultProps: {
    text: 'Label',
    fontSize: 12,
    color: '#858585',
    fontWeight: 'normal',
    uppercase: false,
    letterSpacing: 0,
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { text, fontSize, color, fontWeight, uppercase, letterSpacing } = resolvedProps as {
      text: string
      fontSize: number
      color: string
      fontWeight: string
      uppercase: boolean
      letterSpacing: number
    }
    return (
      <label
        style={{
          display: 'block',
          fontSize,
          color,
          fontWeight,
          textTransform: uppercase ? 'uppercase' : 'none',
          letterSpacing: `${letterSpacing}px`,
          lineHeight: 1.4,
          userSelect: 'none',
        }}
      >
        {text}
      </label>
    )
  },
})
