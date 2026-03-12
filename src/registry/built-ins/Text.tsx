import React from 'react'
import { registerComponent } from '../index'
import { string, number, enumOf, color } from '../schema-helpers'

registerComponent({
  type: 'Text',
  label: 'Text',
  category: 'Basic',
  description: 'Text / heading element',
  propSchema: {
    content: string({ label: 'Content', defaultValue: 'Text', multiline: true }),
    tag: enumOf(
      [
        { value: 'p', label: 'Paragraph' },
        { value: 'h1', label: 'Heading 1' },
        { value: 'h2', label: 'Heading 2' },
        { value: 'h3', label: 'Heading 3' },
        { value: 'span', label: 'Span' },
        { value: 'label', label: 'Label' },
      ],
      { label: 'Tag', defaultValue: 'p' }
    ),
    fontSize: number({ label: 'Font Size', min: 8, max: 128, step: 1, defaultValue: 14 }),
    color: color({ label: 'Color', defaultValue: '#cccccc' }),
  },
  defaultProps: {
    content: 'Text',
    tag: 'p',
    fontSize: 14,
    color: '#cccccc',
  },
  acceptsChildren: false,
  render: ({ resolvedProps }) => {
    const { content, tag = 'p', fontSize, color } = resolvedProps as {
      content: string
      tag: string
      fontSize: number
      color: string
    }
    const style = { fontSize: `${fontSize}px`, color, margin: 0, lineHeight: 1.5 }
    switch (tag) {
      case 'h1': return <h1 style={style}>{content}</h1>
      case 'h2': return <h2 style={style}>{content}</h2>
      case 'h3': return <h3 style={style}>{content}</h3>
      case 'span': return <span style={style}>{content}</span>
      case 'label': return <label style={style}>{content}</label>
      default: return <p style={style}>{content}</p>
    }
  },
})
