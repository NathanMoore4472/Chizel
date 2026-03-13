import React, { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '@/store'
import { isTauri, saveProjectFile, openProjectFile } from '@/utils/file-ops'
import { exportProject } from '@/utils/export-project'
import { FolderOpen, Save, SaveAll, FilePlus, ChevronDown, Download } from 'lucide-react'
import { ROOT_FRAME_ID } from '@/store/slices/tree.slice'

function serializeState() {
  const { tree, dataSources } = useEditorStore.getState()
  return JSON.stringify({ tree, dataSources }, null, 2)
}

export default function FileMenu() {
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentFilePath = useEditorStore(s => s.currentFilePath)
  const setCurrentFilePath = useEditorStore(s => s.setCurrentFilePath)
  const loadState = useEditorStore(s => s.loadState)

  const openMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 2, left: rect.left })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!isTauri()) return null

  const handleNew = () => {
    loadState({
      tree: [{
        id: ROOT_FRAME_ID,
        type: 'Frame',
        label: 'Frame',
        props: { layout: 'absolute', direction: 'column', gap: 16, padding: 24, background: '#1e1e1e', align: 'flex-start', justify: 'flex-start' },
        bindings: {},
        customProps: [],
        events: {},
        extraClasses: '',
        customCss: '',
        children: [],
        parentId: null,
        locked: false,
        visible: true,
      }],
      dataSources: [],
    })
    setCurrentFilePath(null)
    setOpen(false)
  }

  const handleOpen = async () => {
    setOpen(false)
    const result = await openProjectFile()
    if (!result) return
    const { path, data } = result as { path: string; data: { tree: any; dataSources: any } }
    loadState({ tree: data.tree, dataSources: data.dataSources ?? [] })
    setCurrentFilePath(path)
  }

  const handleSave = async () => {
    setOpen(false)
    const json = serializeState()
    const path = await saveProjectFile(json, currentFilePath ?? undefined)
    if (path) setCurrentFilePath(path)
  }

  const handleSaveAs = async () => {
    setOpen(false)
    const json = serializeState()
    const path = await saveProjectFile(json)
    if (path) setCurrentFilePath(path)
  }

  const handleExport = async () => {
    setOpen(false)
    const { tree, dataSources } = useEditorStore.getState()
    const title = currentFilePath ? currentFilePath.split('/').pop()?.replace('.chizel', '') : 'Chizel View'
    try {
      await exportProject({ tree, dataSources }, { title })
    } catch (e) {
      // Show error - for now just console.log
      console.error('Export failed:', e)
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  const filename = currentFilePath
    ? currentFilePath.split('/').pop()
    : 'Untitled'

  return (
    <div className="flex items-center gap-1">
      <button
        ref={buttonRef}
        onClick={openMenu}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-editor-text hover:bg-editor-hover transition-colors"
      >
        File
        <ChevronDown size={10} className="text-editor-muted" />
      </button>

      <span className="text-[10px] text-editor-muted max-w-32 truncate hidden sm:inline" title={currentFilePath ?? ''}>
        {filename}
      </span>

      {open && (
        <div
          ref={dropdownRef}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          className="fixed w-48 bg-editor-panel border border-editor-border rounded shadow-xl z-[999] py-1 text-xs"
        >
          <button
            onClick={handleNew}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-editor-hover text-editor-text text-left"
          >
            <FilePlus size={11} className="text-editor-muted" /> New Project
            <span className="ml-auto text-editor-muted text-[10px]">⌘N</span>
          </button>

          <button
            onClick={handleOpen}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-editor-hover text-editor-text text-left"
          >
            <FolderOpen size={11} className="text-editor-muted" /> Open…
            <span className="ml-auto text-editor-muted text-[10px]">⌘O</span>
          </button>

          <div className="my-1 border-t border-editor-border" />

          <button
            onClick={handleSave}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-editor-hover text-editor-text text-left"
          >
            <Save size={11} className="text-editor-muted" /> Save
            <span className="ml-auto text-editor-muted text-[10px]">⌘S</span>
          </button>

          <button
            onClick={handleSaveAs}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-editor-hover text-editor-text text-left"
          >
            <SaveAll size={11} className="text-editor-muted" /> Save As…
            <span className="ml-auto text-editor-muted text-[10px]">⇧⌘S</span>
          </button>

          <div className="my-1 border-t border-editor-border" />

          <button
            onClick={handleExport}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-editor-hover text-editor-text text-left"
          >
            <Download size={11} className="text-editor-muted" /> Export View…
          </button>
        </div>
      )}
    </div>
  )
}
