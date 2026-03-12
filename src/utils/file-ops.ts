import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { open, save, message } from '@tauri-apps/plugin-dialog'
import { invalidateViewCache } from '@/engine/view-loader'

const FILE_FILTERS = [{ name: 'Chizel Project', extensions: ['chizel'] }]

/** Returns true when running inside Tauri, false in plain browser */
export const isTauri = () => '__TAURI_INTERNALS__' in window

export interface SaveResult {
  path: string
  ok: boolean
}

/** Show a Save dialog and write JSON to disk. Returns the chosen path or null. */
export async function saveProjectFile(json: string, currentPath?: string): Promise<string | null> {
  try {
    const path = currentPath ?? await save({
      title: 'Save Chizel Project',
      filters: FILE_FILTERS,
      defaultPath: 'untitled.chizel',
    })
    if (!path) return null
    await writeTextFile(path, json)
    invalidateViewCache(path)
    return path
  } catch (e) {
    await message(`Failed to save: ${e}`, { title: 'Save Error', kind: 'error' })
    return null
  }
}

/** Show an Open dialog and read a .chizel file. Returns parsed JSON or null. */
export async function openProjectFile(): Promise<{ path: string; data: unknown } | null> {
  try {
    const path = await open({
      title: 'Open Chizel Project',
      filters: FILE_FILTERS,
      multiple: false,
    })
    if (!path || Array.isArray(path)) return null
    const text = await readTextFile(path)
    return { path, data: JSON.parse(text) }
  } catch (e) {
    await message(`Failed to open: ${e}`, { title: 'Open Error', kind: 'error' })
    return null
  }
}
