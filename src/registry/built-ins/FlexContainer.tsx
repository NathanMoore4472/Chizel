import React from 'react'
import { registerComponent } from '../index'
import { number, boolean, enumOf, color, string } from '../schema-helpers'

registerComponent({
  type: 'FlexContainer',
  label: 'Flex Container',
  category: 'Layout',
  description: 'Full-featured flex layout container',
  propSchema: {
    direction: enumOf(
      [
        { value: 'row', label: 'Row' },
        { value: 'row-reverse', label: 'Row Reverse' },
        { value: 'column', label: 'Column' },
        { value: 'column-reverse', label: 'Column Reverse' },
      ],
      { label: 'Direction', defaultValue: 'row' }
    ),
    wrap: enumOf(
      [
        { value: 'nowrap', label: 'No Wrap' },
        { value: 'wrap', label: 'Wrap' },
        { value: 'wrap-reverse', label: 'Wrap Reverse' },
      ],
      { label: 'Wrap', defaultValue: 'nowrap' }
    ),
    alignItems: enumOf(
      [
        { value: 'flex-start', label: 'Start' },
        { value: 'center', label: 'Center' },
        { value: 'flex-end', label: 'End' },
        { value: 'stretch', label: 'Stretch' },
        { value: 'baseline', label: 'Baseline' },
      ],
      { label: 'Align Items', defaultValue: 'flex-start' }
    ),
    justifyContent: enumOf(
      [
        { value: 'flex-start', label: 'Start' },
        { value: 'center', label: 'Center' },
        { value: 'flex-end', label: 'End' },
        { value: 'space-between', label: 'Space Between' },
        { value: 'space-around', label: 'Space Around' },
        { value: 'space-evenly', label: 'Space Evenly' },
      ],
      { label: 'Justify Content', defaultValue: 'flex-start' }
    ),
    gap: number({ label: 'Gap', min: 0, max: 100, step: 1, defaultValue: 8 }),
    padding: number({ label: 'Padding', min: 0, max: 100, step: 1, defaultValue: 0 }),
    background: color({ label: 'Background', defaultValue: 'transparent' }),
    fullWidth: boolean({ label: 'Full Width', defaultValue: true }),
    fullHeight: boolean({ label: 'Full Height', defaultValue: false }),
    width: string({ label: 'Width', defaultValue: '' }),
    height: string({ label: 'Height', defaultValue: '' }),
  },
  defaultProps: {
    direction: 'row',
    wrap: 'nowrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 8,
    padding: 0,
    background: 'transparent',
    fullWidth: true,
    fullHeight: false,
    width: '',
    height: '',
  },
  acceptsChildren: true,
  render: ({ resolvedProps, children }) => {
    const { direction, wrap, alignItems, justifyContent, gap, padding, background, fullWidth, fullHeight, width, height } = resolvedProps as {
      direction: string
      wrap: string
      alignItems: string
      justifyContent: string
      gap: number
      padding: number
      background: string
      fullWidth: boolean
      fullHeight: boolean
      width: string
      height: string
    }
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: direction as React.CSSProperties['flexDirection'],
          flexWrap: wrap as React.CSSProperties['flexWrap'],
          alignItems,
          justifyContent,
          gap,
          padding,
          background,
          width: width || (fullWidth ? '100%' : undefined),
          height: height || (fullHeight ? '100%' : undefined),
          minHeight: 32,
        }}
      >
        {children}
      </div>
    )
  },
})
