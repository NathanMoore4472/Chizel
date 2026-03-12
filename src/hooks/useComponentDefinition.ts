import { getComponent } from '@/registry'
import type { ComponentDefinition } from '@/types'

export function useComponentDefinition(type: string): ComponentDefinition | undefined {
  return getComponent(type)
}
