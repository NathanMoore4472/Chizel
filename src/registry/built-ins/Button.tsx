import React from 'react'
import { registerComponent } from '../index'
import { string, boolean, enumOf } from '../schema-helpers'

registerComponent({
  type: 'Button',
  label: 'Button',
  category: 'Basic',
  description: 'A clickable button',
  propSchema: {
    label: string({ label: 'Label', defaultValue: 'Button' }),
    variant: enumOf(
      [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'danger', label: 'Danger' },
        { value: 'ghost', label: 'Ghost' },
      ],
      { label: 'Variant', defaultValue: 'primary' }
    ),
    disabled: boolean({ label: 'Disabled', defaultValue: false }),
    fullWidth: boolean({ label: 'Full Width', defaultValue: false }),
  },
  defaultProps: {
    label: 'Button',
    variant: 'primary',
    disabled: false,
    fullWidth: false,
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { label, variant, disabled, fullWidth } = resolvedProps as {
      label: string
      variant: string
      disabled: boolean
      fullWidth: boolean
    }
    const variantClass = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/20',
    }[variant] ?? 'bg-blue-600 hover:bg-blue-700 text-white'

    return (
      <button
        disabled={disabled}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${variantClass} ${fullWidth ? 'w-full' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {label}
      </button>
    )
  },
})
