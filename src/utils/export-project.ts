import { isTauri } from './file-ops'

export interface ExportOptions {
  title?: string
}

/**
 * Generates a self-contained viewer HTML by injecting the view data
 * into the pre-built dist-viewer/index.html (or viewer.html for the viewer entry).
 *
 * In the browser: triggers a download of the HTML file.
 * In Tauri: writes to a user-chosen directory via the fs plugin.
 */
export async function exportProject(
  viewData: { tree: unknown[]; dataSources: unknown[] },
  options: ExportOptions = {}
): Promise<void> {
  const dataJson = JSON.stringify(viewData)
  const title = options.title ?? 'Chizel View'

  if (isTauri()) {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { readTextFile, writeTextFile } = await import('@tauri-apps/plugin-fs')

    // Read the built viewer index.html
    let html: string
    try {
      // Try to read from dist-viewer (must have run npm run build:viewer first)
      html = await readTextFile('./dist-viewer/index.html')
    } catch {
      throw new Error('Viewer not built. Run "npm run build:viewer" first.')
    }

    // Inject data and title
    html = html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace('</body>', `<script id="chizel-data" type="application/json">${dataJson}</script>\n</body>`)

    const outPath = await save({
      title: 'Export View',
      filters: [{ name: 'HTML', extensions: ['html'] }],
      defaultPath: 'index.html',
    })
    if (!outPath) return
    await writeTextFile(outPath, html)
    return
  }

  // Browser fallback: download as HTML
  // Build a minimal self-contained HTML with an inline warning that assets need building
  const html = `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #1e1e1e; color: #ccc; font-family: sans-serif;
           display: flex; align-items: center; justify-content: center; height: 100vh; }
    .msg { text-align: center; }
    code { background: #37373d; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="msg">
    <p>Run <code>npm run build:viewer</code> then export from the desktop app to generate a deployable bundle.</p>
  </div>
  <script id="chizel-data" type="application/json">${dataJson}</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'chizel-view.html'
  a.click()
  URL.revokeObjectURL(url)
}
