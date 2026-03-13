import type { RestDataSource, DatabaseDataSource } from '@/types/data-source'
import { isTauri } from '@/utils/file-ops'
import { useEditorStore } from '@/store'

/**
 * Resolves a SQLite connection URL with a relative path (e.g. sqlite://./assets/dev.db)
 * to an absolute path using the current project file's directory.
 */
async function resolveConnectionUrl(url: string): Promise<string> {
  if (!url.startsWith('sqlite://')) return url
  const pathPart = url.slice('sqlite://'.length)
  if (!pathPart.startsWith('.')) return url
  const { dirname, resolve } = await import('@tauri-apps/api/path')
  const currentFilePath = useEditorStore.getState().currentFilePath
  if (!currentFilePath) return url
  const absPath = await resolve(await dirname(currentFilePath), pathPart)
  return 'sqlite://' + absPath
}

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
    const hasBody = !!source.body && source.method !== 'GET'
    const headers: Record<string, string> = { ...source.headers }
    if (hasBody) headers['Content-Type'] = 'application/json'
    const res = await fetch(source.url, {
      method: source.method,
      headers,
      body: hasBody ? source.body : undefined,
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

const CHIZEL_SERVER = 'http://127.0.0.1:7878'

export async function fetchDatabaseDataSource(
  source: DatabaseDataSource,
  callbacks: RunnerCallbacks
): Promise<void> {
  if (!source.connectionUrl.trim() || !source.query.trim()) {
    callbacks.onError('Connection URL and query are required')
    return
  }
  callbacks.onLoading(true)
  try {
    if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core')
      const rows = await invoke<Record<string, unknown>[]>('query_database', {
        connectionUrl: await resolveConnectionUrl(source.connectionUrl),
        query: source.query,
      })
      callbacks.onData(rows)
    } else {
      const res = await fetch(`${CHIZEL_SERVER}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_url: source.connectionUrl, query: source.query }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      callbacks.onData(await res.json())
    }
    callbacks.onError('')
  } catch (e) {
    callbacks.onError(e instanceof Error ? e.message : String(e))
  } finally {
    callbacks.onLoading(false)
  }
}

export async function testDatabaseConnection(connectionUrl: string): Promise<string> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      return await invoke<string>('test_database_connection', { connectionUrl: await resolveConnectionUrl(connectionUrl) })
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e))
    }
  } else {
    const res = await fetch(`${CHIZEL_SERVER}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_url: connectionUrl, query: '' }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? `HTTP ${res.status}`)
    }
    return 'Connected successfully'
  }
}

export async function closeDatabaseConnection(connectionUrl: string): Promise<void> {
  if (!isTauri()) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('close_database_connection', { connectionUrl })
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
