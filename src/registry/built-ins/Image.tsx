import React from 'react'
import { registerComponent } from '../index'
import { string, number, enumOf, boolean } from '../schema-helpers'

registerComponent({
  type: 'Image',
  label: 'Image',
  category: 'Basic',
  description: 'Image element with fallback',
  propSchema: {
    src: string({ label: 'Source URL', defaultValue: '' }),
    alt: string({ label: 'Alt Text', defaultValue: '' }),
    width: number({ label: 'Width', min: 0, max: 2000, step: 1, defaultValue: 200 }),
    height: number({ label: 'Height', min: 0, max: 2000, step: 1, defaultValue: 150 }),
    objectFit: enumOf(
      [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
        { value: 'fill', label: 'Fill' },
        { value: 'none', label: 'None' },
      ],
      { label: 'Object Fit', defaultValue: 'cover' }
    ),
    borderRadius: number({ label: 'Border Radius', min: 0, max: 200, step: 1, defaultValue: 0 }),
    fullWidth: boolean({ label: 'Full Width', defaultValue: false }),
  },
  defaultProps: {
    src: '',
    alt: '',
    width: 200,
    height: 150,
    objectFit: 'cover',
    borderRadius: 0,
    fullWidth: false,
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { src, alt, width, height, objectFit, borderRadius, fullWidth } = resolvedProps as {
      src: string
      alt: string
      width: number
      height: number
      objectFit: string
      borderRadius: number
      fullWidth: boolean
    }

    if (!src) {
      return (
        <div
          style={{
            width: fullWidth ? '100%' : width,
            height,
            borderRadius,
            background: '#37373d',
            border: '1px dashed #858585',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#858585',
            fontSize: 12,
          }}
        >
          No image
        </div>
      )
    }

    return (
      <img
        src={src}
        alt={alt}
        style={{
          width: fullWidth ? '100%' : width,
          height,
          objectFit: objectFit as React.CSSProperties['objectFit'],
          borderRadius,
          display: 'block',
        }}
      />
    )
  },
})
