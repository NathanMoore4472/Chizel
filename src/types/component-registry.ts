import type { ComponentType } from 'react'
import type { ComponentNode } from './component-node'

export type PropSchemaKind = 'string' | 'number' | 'boolean' | 'color' | 'enum' | 'object' | 'array'

export interface BasePropSchema {
  kind: PropSchemaKind
  label?: string
  description?: string
  required?: boolean
  defaultValue?: unknown
}

export interface StringPropSchema extends BasePropSchema {
  kind: 'string'
  multiline?: boolean
  placeholder?: string
}

export interface NumberPropSchema extends BasePropSchema {
  kind: 'number'
  min?: number
  max?: number
  step?: number
}

export interface BooleanPropSchema extends BasePropSchema {
  kind: 'boolean'
}

export interface ColorPropSchema extends BasePropSchema {
  kind: 'color'
}

export interface EnumPropSchema extends BasePropSchema {
  kind: 'enum'
  options: Array<{ value: string; label: string }>
}

export interface ObjectPropSchema extends BasePropSchema {
  kind: 'object'
}

export interface ArrayPropSchema extends BasePropSchema {
  kind: 'array'
}

export type PropSchema =
  | StringPropSchema
  | NumberPropSchema
  | BooleanPropSchema
  | ColorPropSchema
  | EnumPropSchema
  | ObjectPropSchema
  | ArrayPropSchema

export interface ComponentDefinition {
  type: string
  label: string
  description?: string
  icon?: string
  category?: string
  propSchema: Record<string, PropSchema>
  defaultProps: Record<string, unknown>
  acceptsChildren?: boolean
  render: ComponentType<{ node: ComponentNode; resolvedProps: Record<string, unknown>; children?: React.ReactNode }>
}
