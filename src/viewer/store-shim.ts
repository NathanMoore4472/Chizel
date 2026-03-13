// Re-export viewer store as useEditorStore so canvas/engine imports resolve correctly.
// Kept separate from ViewerApp.tsx to avoid circular dependency:
//   ViewerApp → NodeRenderer → @/store (this shim) → ViewerApp  ← breaks here
export { useViewerStore as useEditorStore } from './viewer-store'
