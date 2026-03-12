import React from 'react'
import { registerComponent } from '../index'
import { string, boolean, enumOf } from '../schema-helpers'

registerComponent({
  type: 'Input',
  label: 'Input',
  category: 'Form',
  description: 'Text input field',
  propSchema: {
    placeholder: string({ label: 'Placeholder', defaultValue: '' }),
    value: string({ label: 'Value', defaultValue: '' }),
    label: string({ label: 'Label', defaultValue: '' }),
    type: enumOf(
      [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'email', label: 'Email' },
        { value: 'password', label: 'Password' },
      ],
      { label: 'Type', defaultValue: 'text' }
    ),
    disabled: boolean({ label: 'Disabled', defaultValue: false }),
    fullWidth: boolean({ label: 'Full Width', defaultValue: false }),
  },
  defaultProps: {
    placeholder: '',
    value: '',
    label: '',
    type: 'text',
    disabled: false,
    fullWidth: false,
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { placeholder, value, label, type, disabled, fullWidth } = resolvedProps as {
      placeholder: string
      value: string
      label: string
      type: string
      disabled: boolean
      fullWidth: boolean
    }
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-xs text-gray-400 mb-1">{label}</label>
        )}
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={value}
          disabled={disabled}
          className="bg-editor-active border border-editor-border rounded px-2 py-1 text-sm text-editor-text focus:outline-none focus:border-blue-500 disabled:opacity-50"
          style={{ width: fullWidth ? '100%' : undefined }}
        />
      </div>
    )
  },
})
