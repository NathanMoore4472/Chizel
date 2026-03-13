import type { ComponentNode } from '@/types/component-node'
import type { DataSource } from '@/types/data-source'
import { isTauri } from '@/utils/file-ops'
import { useEditorStore } from '@/store'

export interface ViewFile {
  tree: ComponentNode[]
  dataSources: DataSource[]
}

/** Module-level cache so repeated renders don't re-read disk */
const cache = new Map<string, ViewFile>()
const pending = new Map<string, Promise<ViewFile>>()

export async function loadViewFile(src: string): Promise<ViewFile> {
  if (cache.has(src)) return cache.get(src)!
  if (pending.has(src)) return pending.get(src)!

  const load = async (): Promise<ViewFile> => {
    let text: string
    if (isTauri()) {
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      let resolvedSrc = src
      if (src.startsWith('.')) {
        const { dirname, resolve } = await import('@tauri-apps/api/path')
        const currentFilePath = useEditorStore.getState().currentFilePath
        if (currentFilePath) {
          resolvedSrc = await resolve(await dirname(currentFilePath), src)
        }
      }
      text = await readTextFile(resolvedSrc)
    } else {
      // Browser fallback — useful if src is a URL or data URI
      const res = await fetch(src)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      text = await res.text()
    }
    const data = JSON.parse(text) as ViewFile
    cache.set(src, data)
    pending.delete(src)
    return data
  }

  const promise = load()
  pending.set(src, promise)
  return promise
}

/** Invalidate a cached file (call after the file is saved) */
export function invalidateViewCache(src: string) {
  cache.delete(src)
}

/** Extract the root Frame's customProps from a loaded view — these are the view's params */
export function getViewParams(view: ViewFile) {
  const frame = view.tree.find(n => n.type === 'Frame')
  return frame?.customProps ?? []
}

/** Merge caller-supplied param values into the root Frame's props */
export function injectParams(
  tree: ComponentNode[],
  params: Record<string, unknown>
): ComponentNode[] {
  return tree.map(node =>
    node.type === 'Frame'
      ? { ...node, props: { ...node.props, ...params } }
      : node
  )
}
