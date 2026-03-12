import type { Binding } from './binding'

export type CustomPropType = 'string' | 'number' | 'boolean'

export interface CustomPropDef {
  name: string
  type: CustomPropType
}

export interface ComponentNode {
  id: string
  type: string
  label?: string
  props: Record<string, unknown>
  bindings: Record<string, Binding>
  customProps: CustomPropDef[]
  children: ComponentNode[]
  parentId: string | null
  locked: boolean
  visible: boolean
  style?: {
    x?: number
    y?: number
    width?: number | string
    height?: number | string
  }
}

export interface ChildSlot {
  name: string
  label?: string
  accepts?: string[]
}
