import type { ComponentDefinition } from '@/types'
import { z } from 'zod'

const registry = new Map<string, ComponentDefinition>()

const propSchemaValidator = z.object({
  kind: z.enum(['string', 'number', 'boolean', 'color', 'enum', 'object', 'array']),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
}).passthrough()

const componentDefinitionValidator = z.object({
  type: z.string().min(1),
  label: z.string().min(1),
  propSchema: z.record(z.string(), propSchemaValidator),
  defaultProps: z.record(z.string(), z.unknown()),
  render: z.any(),
})

export function registerComponent(def: ComponentDefinition): void {
  try {
    componentDefinitionValidator.parse(def)
  } catch (e) {
    console.error(`[Registry] Invalid component definition for "${def.type}":`, e)
    return
  }
  registry.set(def.type, def)
}

export function getComponent(type: string): ComponentDefinition | undefined {
  return registry.get(type)
}

export function getAllComponents(): ComponentDefinition[] {
  return Array.from(registry.values())
}

export function hasComponent(type: string): boolean {
  return registry.has(type)
}
