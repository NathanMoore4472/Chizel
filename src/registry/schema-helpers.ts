import type {
  StringPropSchema,
  NumberPropSchema,
  BooleanPropSchema,
  ColorPropSchema,
  EnumPropSchema,
} from '@/types'

export function string(opts: Partial<Omit<StringPropSchema, 'kind'>> = {}): StringPropSchema {
  return { kind: 'string', ...opts }
}

export function number(opts: Partial<Omit<NumberPropSchema, 'kind'>> = {}): NumberPropSchema {
  return { kind: 'number', ...opts }
}

export function boolean(opts: Partial<Omit<BooleanPropSchema, 'kind'>> = {}): BooleanPropSchema {
  return { kind: 'boolean', ...opts }
}

export function color(opts: Partial<Omit<ColorPropSchema, 'kind'>> = {}): ColorPropSchema {
  return { kind: 'color', ...opts }
}

export function enumOf(
  options: Array<{ value: string; label: string }>,
  opts: Partial<Omit<EnumPropSchema, 'kind' | 'options'>> = {}
): EnumPropSchema {
  return { kind: 'enum', options, ...opts }
}
