import React from 'react'
import { registerComponent } from '../index'
import { string, color, number, enumOf } from '../schema-helpers'

registerComponent({
  type: 'Badge',
  label: 'Badge',
  category: 'Basic',
  description: 'Small status or count badge',
  propSchema: {
    text: string({ label: 'Text', defaultValue: 'Badge' }),
    variant: enumOf(
      [
        { value: 'default', label: 'Default' },
        { value: 'success', label: 'Success' },
        { value: 'warning', label: 'Warning' },
        { value: 'danger', label: 'Danger' },
        { value: 'info', label: 'Info' },
      ],
      { label: 'Variant', defaultValue: 'default' }
    ),
    background: color({ label: 'Custom Background', defaultValue: '' }),
    textColor: color({ label: 'Custom Text Color', defaultValue: '' }),
    borderRadius: number({ label: 'Border Radius', min: 0, max: 24, step: 1, defaultValue: 4 }),
    fontSize: number({ label: 'Font Size', min: 8, max: 24, step: 1, defaultValue: 11 }),
  },
  defaultProps: {
    text: 'Badge',
    variant: 'default',
    background: '',
    textColor: '',
    borderRadius: 4,
    fontSize: 11,
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { text, variant, background, textColor, borderRadius, fontSize } = resolvedProps as {
      text: string
      variant: string
      background: string
      textColor: string
      borderRadius: number
      fontSize: number
    }

    const variantStyles: Record<string, { background: string; color: string }> = {
      default: { background: '#37373d', color: '#cccccc' },
      success: { background: '#1a4731', color: '#4ade80' },
      warning: { background: '#3f2d00', color: '#fbbf24' },
      danger:  { background: '#4a1414', color: '#f87171' },
      info:    { background: '#0e3450', color: '#60a5fa' },
    }

    const styles = variantStyles[variant] ?? variantStyles.default

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius,
          fontSize,
          fontWeight: 500,
          lineHeight: 1.5,
          background: background || styles.background,
          color: textColor || styles.color,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    )
  },
})
