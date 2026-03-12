import React from 'react'
import { registerComponent } from '../index'
import { number, enumOf } from '../schema-helpers'

registerComponent({
  type: 'Stack',
  label: 'Stack',
  category: 'Layout',
  description: 'Flex layout container',
  propSchema: {
    direction: enumOf(
      [
        { value: 'row', label: 'Row (Horizontal)' },
        { value: 'column', label: 'Column (Vertical)' },
      ],
      { label: 'Direction', defaultValue: 'column' }
    ),
    gap: number({ label: 'Gap', min: 0, max: 100, step: 1, defaultValue: 8 }),
    padding: number({ label: 'Padding', min: 0, max: 100, step: 1, defaultValue: 0 }),
    align: enumOf(
      [
        { value: 'flex-start', label: 'Start' },
        { value: 'center', label: 'Center' },
        { value: 'flex-end', label: 'End' },
        { value: 'stretch', label: 'Stretch' },
      ],
      { label: 'Align Items', defaultValue: 'flex-start' }
    ),
    justify: enumOf(
      [
        { value: 'flex-start', label: 'Start' },
        { value: 'center', label: 'Center' },
        { value: 'flex-end', label: 'End' },
        { value: 'space-between', label: 'Space Between' },
      ],
      { label: 'Justify Content', defaultValue: 'flex-start' }
    ),
  },
  defaultProps: {
    direction: 'column',
    gap: 8,
    padding: 0,
    align: 'flex-start',
    justify: 'flex-start',
  },
  acceptsChildren: true,
  render: ({ resolvedProps, children }) => {
    const { direction, gap, padding, align, justify } = resolvedProps as {
      direction: 'row' | 'column'
      gap: number
      padding: number
      align: string
      justify: string
    }
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          gap,
          padding,
          alignItems: align,
          justifyContent: justify,
          minHeight: 32,
        }}
      >
        {children}
      </div>
    )
  },
})
