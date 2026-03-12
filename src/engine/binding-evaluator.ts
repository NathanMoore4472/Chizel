import type { Binding } from '@/types/binding'
import type { EvalContext } from './context-builder'
import { evaluateExpression } from './expression-sandbox'
import { JSONPath } from 'jsonpath-plus'

export function evaluateBinding(binding: Binding, ctx: EvalContext): unknown {
  if (binding.kind === 'expression') {
    const { value, error } = evaluateExpression(binding.expression, ctx)
    if (error !== null) {
      return binding.fallback
    }
    return value
  }

  if (binding.kind === 'data-source') {
    const sourceData = ctx.sources[binding.sourceName]
    if (sourceData === null || sourceData === undefined) {
      return binding.fallback
    }
    try {
      const result = JSONPath({ path: binding.path, json: sourceData })
      let value = Array.isArray(result) && result.length === 1 ? result[0] : result

      if (binding.transform) {
        const { value: transformed, error } = evaluateExpression(binding.transform, { value, ctx })
        if (!error) value = transformed
      }

      return value ?? binding.fallback
    } catch {
      return binding.fallback
    }
  }

  return undefined
}
