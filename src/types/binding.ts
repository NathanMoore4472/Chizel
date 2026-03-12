export interface ExpressionBinding {
  kind: 'expression'
  propName: string
  expression: string
  fallback?: unknown
  parseError?: string
}

export interface DataSourceBinding {
  kind: 'data-source'
  propName: string
  sourceName: string
  path: string
  transform?: string
  fallback?: unknown
}

export type Binding = ExpressionBinding | DataSourceBinding
