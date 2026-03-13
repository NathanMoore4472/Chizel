export interface RestDataSource {
  kind: 'rest'
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: string
  pollInterval?: number
  enabled: boolean
}

export interface StoreDataSource {
  kind: 'store'
  name: string
  initialData: unknown
}

export interface DatabaseDataSource {
  kind: 'database'
  name: string
  connectionUrl: string
  query: string
  pollInterval?: number
  enabled: boolean
}

export type DataSource = RestDataSource | StoreDataSource | DatabaseDataSource

export interface DataSourceState {
  data: unknown
  loading: boolean
  error: string | null
  lastFetched: number | null
}
