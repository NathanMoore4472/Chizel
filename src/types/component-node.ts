import type { Binding } from './binding'

export interface ComponentNode {
  id: string
  type: string
  label?: string
  props: Record<string, unknown>
  bindings: Record<string, Binding>
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
