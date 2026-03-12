import React from 'react'
import { registerComponent } from '../index'
import { color, number, enumOf, boolean } from '../schema-helpers'

registerComponent({
  type: 'Frame',
  label: 'Frame',
  description: 'Root canvas frame — holds all components',
  // Not shown in palette
  hidden: true,
  propSchema: {
    layout: enumOf(
      [
        { value: 'absolute', label: 'Free (x / y)' },
        { value: 'flex', label: 'Flex' },
      ],
      { label: 'Layout', defaultValue: 'absolute' }
    ),
    direction: enumOf(
      [
        { value: 'row', label: 'Row' },
        { value: 'column', label: 'Column' },
      ],
      { label: 'Direction', defaultValue: 'column' }
    ),
    gap: number({ label: 'Gap', min: 0, max: 100, step: 1, defaultValue: 16 }),
    padding: number({ label: 'Padding', min: 0, max: 200, step: 1, defaultValue: 24 }),
    background: color({ label: 'Background', defaultValue: '#1e1e1e' }),
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
    layout: 'absolute',
    direction: 'column',
    gap: 16,
    padding: 24,
    background: '#1e1e1e',
    align: 'flex-start',
    justify: 'flex-start',
  },
  acceptsChildren: true,
  childLayout: (props) => props.layout === 'absolute' ? 'absolute' : 'flow',
  render: ({ resolvedProps, children }) => {
    const { layout, direction, gap, padding, background, align, justify } = resolvedProps as {
      layout: string
      direction: string
      gap: number
      padding: number
      background: string
      align: string
      justify: string
    }

    if (layout === 'absolute') {
      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background,
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: direction as React.CSSProperties['flexDirection'],
          gap,
          padding,
          alignItems: align,
          justifyContent: justify,
          background,
          width: '100%',
          minHeight: '100%',
        }}
      >
        {children}
      </div>
    )
  },
})
