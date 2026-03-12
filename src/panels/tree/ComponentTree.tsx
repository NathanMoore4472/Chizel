import React from 'react'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useEditorStore } from '@/store'
import TreeNode from './TreeNode'
import { flattenTree } from '@/utils/tree-ops'
import { Layers } from 'lucide-react'

export default function ComponentTree() {
  const tree = useEditorStore(s => s.tree)
  const allNodes = flattenTree(tree)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-editor-border">
        <Layers size={11} className="text-editor-muted" />
        <span className="text-xs font-semibold text-editor-muted uppercase tracking-wider">
          Layers
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <SortableContext
          items={allNodes.map(n => n.id)}
          strategy={verticalListSortingStrategy}
        >
          {tree.map(node => (
            <TreeNode key={node.id} node={node} depth={0} />
          ))}
        </SortableContext>
        {tree.length === 0 && (
          <div className="text-xs text-editor-muted text-center py-4">No components</div>
        )}
      </div>
    </div>
  )
}
