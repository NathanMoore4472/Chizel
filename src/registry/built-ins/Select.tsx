import React from 'react'
import { registerComponent } from '../index'
import { string, boolean } from '../schema-helpers'

registerComponent({
  type: 'Select',
  label: 'Select',
  category: 'Form',
  description: 'Dropdown select input',
  propSchema: {
    label: string({ label: 'Label', defaultValue: '' }),
    placeholder: string({ label: 'Placeholder', defaultValue: 'Select...' }),
    options: string({ label: 'Options (comma separated)', defaultValue: 'Option 1, Option 2, Option 3' }),
    value: string({ label: 'Selected Value', defaultValue: '' }),
    disabled: boolean({ label: 'Disabled', defaultValue: false }),
    fullWidth: boolean({ label: 'Full Width', defaultValue: false }),
  },
  defaultProps: {
    label: '',
    placeholder: 'Select...',
    options: 'Option 1, Option 2, Option 3',
    value: '',
    disabled: false,
    fullWidth: false,
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { label, placeholder, options, value, disabled, fullWidth } = resolvedProps as {
      label: string
      placeholder: string
      options: string
      value: string
      disabled: boolean
      fullWidth: boolean
    }

    const optionList = options
      .split(',')
      .map(o => o.trim())
      .filter(Boolean)

    return (
      <div style={{ width: fullWidth ? '100%' : undefined }}>
        {label && (
          <label style={{ display: 'block', fontSize: 11, color: '#858585', marginBottom: 4 }}>
            {label}
          </label>
        )}
        <select
          defaultValue={value}
          disabled={disabled}
          style={{
            width: fullWidth ? '100%' : undefined,
            background: '#37373d',
            border: '1px solid #3c3c3c',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 13,
            color: '#cccccc',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            outline: 'none',
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {optionList.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  },
})
