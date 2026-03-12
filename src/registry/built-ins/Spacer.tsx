import React from 'react'
import { registerComponent } from '../index'
import { number, boolean } from '../schema-helpers'

registerComponent({
  type: 'Spacer',
  label: 'Spacer',
  category: 'Layout',
  description: 'Flexible empty space between elements',
  propSchema: {
    size: number({ label: 'Size (px)', min: 0, max: 400, step: 1, defaultValue: 16 }),
    flex: boolean({ label: 'Flex Grow (fill space)', defaultValue: false }),
  },
  defaultProps: {
    size: 16,
    flex: false,
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { size, flex } = resolvedProps as { size: number; flex: boolean }
    return (
      <div
        style={{
          flexGrow: flex ? 1 : 0,
          flexShrink: 0,
          width: size,
          height: size,
          minWidth: flex ? undefined : size,
          minHeight: flex ? undefined : size,
        }}
      />
    )
  },
})
