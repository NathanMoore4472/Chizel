import { isTauri } from './file-ops'

declare const __APP_ROOT__: string

export interface ExportOptions {
  title?: string
}

/**
 * Exports the view as a deployable project to a user-chosen folder.
 * Writes index.html (with view data embedded) + copies assets/ alongside it.
 */
export async function exportProject(
  viewData: { tree: unknown[]; dataSources: unknown[] },
  options: ExportOptions = {}
): Promise<void> {
  const dataJson = JSON.stringify(viewData)
  const title = options.title ?? 'Chizel View'

  if (!isTauri()) {
    alert('Export to folder requires the desktop app. Use File → Save to save your project as a .chizel file instead.')
    return
  }

  const { open } = await import('@tauri-apps/plugin-dialog')
  const { readTextFile, writeTextFile, readDir, mkdir } = await import('@tauri-apps/plugin-fs')

  // Ask user to pick an output folder
  const outputDir = await open({
    title: 'Choose Export Folder',
    directory: true,
  })
  if (!outputDir || Array.isArray(outputDir)) return

  const viewerRoot = `${__APP_ROOT__}/dist-viewer`

  // Verify the viewer has been built
  try {
    await readTextFile(`${viewerRoot}/viewer.html`)
  } catch {
    throw new Error('Viewer not built. Run "npm run build:viewer" first.')
  }

  // Read, inject data + title, write index.html
  let html = await readTextFile(`${viewerRoot}/viewer.html`)
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace('</body>', `<script id="chizel-data" type="application/json">${dataJson}</script>\n</body>`)
  await writeTextFile(`${outputDir}/index.html`, html)

  // Copy assets/ folder so JS + CSS are alongside the HTML
  await mkdir(`${outputDir}/assets`, { recursive: true })
  const assets = await readDir(`${viewerRoot}/assets`)
  for (const entry of assets) {
    if (!entry.name) continue
    const content = await readTextFile(`${viewerRoot}/assets/${entry.name}`)
    await writeTextFile(`${outputDir}/assets/${entry.name}`, content)
  }

  alert(`Exported to ${outputDir}\n\nServe the folder with any static web server to view it.`)
}
