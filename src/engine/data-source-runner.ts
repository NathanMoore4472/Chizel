import type { RestDataSource } from '@/types/data-source'

export interface RunnerCallbacks {
  onData: (data: unknown) => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
}

export async function fetchRestDataSource(
  source: RestDataSource,
  callbacks: RunnerCallbacks
): Promise<void> {
  callbacks.onLoading(true)
  try {
    const res = await fetch(source.url, {
      method: source.method,
      headers: {
        'Content-Type': 'application/json',
        ...source.headers,
      },
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

const pollingIntervals = new Map<string, ReturnType<typeof setInterval>>()

export function startPolling(
  source: RestDataSource,
  callbacks: RunnerCallbacks
): void {
  stopPolling(source.name)
  fetchRestDataSource(source, callbacks)
  if (source.pollInterval && source.pollInterval > 0) {
    const id = setInterval(() => fetchRestDataSource(source, callbacks), source.pollInterval)
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
