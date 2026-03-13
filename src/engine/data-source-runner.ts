import type { RestDataSource, DatabaseDataSource } from '@/types/data-source'
import { isTauri } from '@/utils/file-ops'

export interface RunnerCallbacks {
  onData: (data: unknown) => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
}

// ─── REST ────────────────────────────────────────────────────────────────────

export async function fetchRestDataSource(
  source: RestDataSource,
  callbacks: RunnerCallbacks
): Promise<void> {
  callbacks.onLoading(true)
  try {
    const res = await fetch(source.url, {
      method: source.method,
      headers: { 'Content-Type': 'application/json', ...source.headers },
      body: source.body && source.method !== 'GET' ? source.body : undefined,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    const data = await res.json()
    callbacks.onData(data)
    callbacks.onError('')
  } catch (e) {
    callbacks.onError(e instanceof Error ? e.message : String(e))
  } finally {
    callbacks.onLoading(false)
  }
}

// ─── Database ────────────────────────────────────────────────────────────────

export async function fetchDatabaseDataSource(
  source: DatabaseDataSource,
  callbacks: RunnerCallbacks
): Promise<void> {
  if (!isTauri()) {
    callbacks.onError('Database sources require the desktop app (Tauri)')
    return
  }
  if (!source.connectionUrl.trim() || !source.query.trim()) {
    callbacks.onError('Connection URL and query are required')
    return
  }
  callbacks.onLoading(true)
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const rows = await invoke<Record<string, unknown>[]>('query_database', {
      connection_url: source.connectionUrl,
      query: source.query,
    })
    callbacks.onData(rows)
    callbacks.onError('')
  } catch (e) {
    callbacks.onError(e instanceof Error ? e.message : String(e))
  } finally {
    callbacks.onLoading(false)
  }
}

export async function testDatabaseConnection(connectionUrl: string): Promise<string> {
  if (!isTauri()) return 'Database connections require the desktop app'
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    return await invoke<string>('test_database_connection', { connection_url: connectionUrl })
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : String(e))
  }
}

export async function closeDatabaseConnection(connectionUrl: string): Promise<void> {
  if (!isTauri()) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('close_database_connection', { connection_url: connectionUrl })
  } catch { /* ignore */ }
}

// ─── Polling ─────────────────────────────────────────────────────────────────

const pollingIntervals = new Map<string, ReturnType<typeof setInterval>>()

export function startPolling(
  source: RestDataSource | DatabaseDataSource,
  callbacks: RunnerCallbacks
): void {
  stopPolling(source.name)
  const fetch = source.kind === 'database'
    ? () => fetchDatabaseDataSource(source as DatabaseDataSource, callbacks)
    : () => fetchRestDataSource(source as RestDataSource, callbacks)

  fetch()
  if (source.pollInterval && source.pollInterval > 0) {
    const id = setInterval(fetch, source.pollInterval)
    pollingIntervals.set(source.name, id)
  }
}

export function stopPolling(name: string): void {
  const id = pollingIntervals.get(name)
  if (id !== undefined) {
    clearInterval(id)
    pollingIntervals.delete(name)
  }
}
