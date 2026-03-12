# Chizel — Visual Web Development Editor

## Context

Building a greenfield visual editor app (similar to Ignition's Perspective Editor) focused on React web development. Users drag components onto a live canvas, edit props via a properties panel, and bind props to JS expressions or named data sources. The output is a React component tree defined by a JSON schema rendered live in the editor.

---

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS (dark/IDE theme)
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag & drop
- `zustand` + `immer` — state management + immutable tree mutations
- `@monaco-editor/react` — expression/code input in bindings (lazy-loaded)
- `zod` — component definition validation at registration time
- `nanoid` — node ID generation
- `lucide-react` — icons
- `clsx` + `tailwind-merge` — class utilities
- `jsonpath-plus` — data source path traversal
- `@radix-ui/react-*` — accessible UI primitives (tooltips, popovers, tabs, context menus)

---

## File Structure

```
src/
├── main.tsx
├── App.tsx
├── types/
│   ├── index.ts                  # Re-exports all types
│   ├── component-node.ts         # ComponentNode, ChildSlot
│   ├── binding.ts                # Binding, ExpressionBinding, DataSourceBinding
│   ├── data-source.ts            # DataSource, RestDataSource, StoreDataSource
│   ├── component-registry.ts    # ComponentDefinition, PropSchema variants
│   └── editor-state.ts           # Full EditorState shape + action signatures
├── registry/
│   ├── index.ts                  # Singleton Map + register/lookup API
│   ├── schema-helpers.ts         # string(), number(), boolean(), color(), enumOf()
│   └── built-ins/
│       ├── index.ts              # Imports all built-ins (run at app init)
│       ├── Button.tsx
│       ├── Text.tsx
│       ├── Input.tsx
│       ├── Container.tsx
│       ├── Stack.tsx
│       └── Grid.tsx
├── store/
│   ├── index.ts                  # createStore() + useEditorStore hook
│   └── slices/
│       ├── tree.slice.ts
│       ├── selection.slice.ts
│       ├── bindings.slice.ts
│       ├── data-sources.slice.ts
│       ├── drag.slice.ts
│       └── history.slice.ts
├── engine/
│   ├── binding-evaluator.ts      # evaluateBinding(binding, context) → value
│   ├── expression-sandbox.ts     # new Function evaluator + memoized compile cache
│   ├── data-source-runner.ts     # REST fetch, polling, cache
│   └── context-builder.ts        # Builds EvalContext from store state
├── canvas/
│   ├── Canvas.tsx                # Drop zone, renders root nodes, DndContext
│   ├── CanvasToolbar.tsx         # Zoom, preview toggle, undo/redo
│   ├── NodeRenderer.tsx          # Recursive node → React element + binding resolution
│   ├── SelectionOverlay.tsx      # Blue border + resize handles on selected node
│   └── DropZoneIndicator.tsx     # Insert line / highlight on hover
├── panels/
│   ├── palette/
│   │   ├── ComponentPalette.tsx
│   │   └── PaletteItem.tsx       # useDraggable with data: { kind: 'palette', type }
│   ├── tree/
│   │   ├── ComponentTree.tsx
│   │   └── TreeNode.tsx          # Indent, icon, label, sortable
│   ├── props/
│   │   ├── PropsPanel.tsx
│   │   ├── PropField.tsx         # Dispatcher to typed field editors
│   │   ├── BindingIndicator.tsx  # Icon shown on bound props
│   │   └── fields/
│   │       ├── StringField.tsx
│   │       ├── NumberField.tsx
│   │       ├── BooleanField.tsx
│   │       ├── ColorField.tsx
│   │       └── EnumField.tsx
│   └── bindings/
│       ├── BindingsPanel.tsx     # Tabs: Expression / Data Source
│       ├── ExpressionEditor.tsx  # Monaco (lazy-loaded)
│       └── DataSourcePicker.tsx  # Source CRUD + JSONPath picker
├── layout/
│   ├── AppLayout.tsx             # 3-panel CSS Grid shell
│   ├── LeftSidebar.tsx           # Palette (top) + Tree (bottom)
│   ├── RightSidebar.tsx          # Props + Bindings (tabbed)
│   └── ResizeHandle.tsx          # Draggable panel border
├── hooks/
│   ├── useSelectedNode.ts
│   ├── useComponentDefinition.ts
│   ├── useBindingContext.ts
│   └── useDataSource.ts
└── utils/
    ├── id.ts                     # generateId() via nanoid
    ├── tree-ops.ts               # Pure: insert, remove, move in tree
    ├── deep-clone.ts             # structuredClone wrapper
    └── cn.ts                     # clsx + tailwind-merge
```

---

## Core Data Model

### ComponentNode

```ts
interface ComponentNode {
  id: string;
  type: string; // Registry key e.g. "Button"
  label?: string;
  props: Record<string, unknown>; // Static prop values
  bindings: Record<string, Binding>; // Key = prop name
  children: ComponentNode[];
  parentId: string | null;
  locked: boolean;
  visible: boolean;
  style?: {
    x?: number;
    y?: number;
    width?: number | string;
    height?: number | string;
  };
}
```

### Binding (union)

```ts
type Binding = ExpressionBinding | DataSourceBinding;

interface ExpressionBinding {
  kind: "expression";
  propName: string;
  expression: string; // e.g. "ctx.sources.users[0].name"
  fallback?: unknown;
  parseError?: string;
}

interface DataSourceBinding {
  kind: "data-source";
  propName: string;
  sourceName: string; // Name of registered DataSource
  path: string; // JSONPath e.g. "$.results[0].name"
  transform?: string; // Optional post-transform expression
  fallback?: unknown;
}
```

### DataSource (union)

```ts
type DataSource = RestDataSource | StoreDataSource;
// RestDataSource: url, method, headers, body, polling config, auth
// StoreDataSource: initialData (design-time preview data)
```

---

## Key Architecture Decisions

### Canvas Rendering

- `NodeRenderer` is a recursive component: resolves bindings → renders registered component → maps children to nested `NodeRenderer`
- `SelectionOverlay` wraps each rendered node in edit mode; intercepts pointer events to drive `selectNode`
- Top-level nodes use `node.style.x/y` for absolute positioning; children inside Container/Stack use natural flow layout

### Binding Evaluation

- `evaluateBinding` runs at render time per bound prop
- Expression bindings: `new Function('ctx', 'return ' + expr)` — memoize compiled fn by expression string
- Data source bindings: read `dataSourceStates[name].data` then traverse `path` via jsonpath-plus
- `EvalContext`: `{ props, state, sources, env: { now, url } }`

### Drag & Drop (3 scenarios)

1. **Palette → Canvas**: PaletteItem `useDraggable` + Canvas `useDroppable` → `addNode(newNode, null, x, y)`
2. **Canvas → Canvas reposition**: DragHandle per node → `updateNodeStyle` or `moveNode` into container
3. **Tree reorder**: `@dnd-kit/sortable` on TreeNode → `moveNode`

### Store (Zustand + Immer)

- Single `create<EditorState>()` with slices composed via spread
- Immer middleware for all mutations
- Before every tree-mutating action: auto-snapshot to `history.past` (max 50 entries)
- Multi-page-ready structure: tree nested under a page key even if only one page shown in MVP

---

## Implementation Phases

### Phase 1 — Foundation

- Init Vite project, install all deps, configure Tailwind dark theme
- Write all types (`src/types/`)
- Implement registry + schema helpers + built-in registrations (minimal renderers)
- Implement full Zustand store with all slices + Immer + history
- Write `tree-ops.ts` pure utilities with Vitest unit tests
- **Exit:** `useEditorStore` fully functional; add/remove/move/undo tested

### Phase 2 — Layout Shell + Canvas

- `AppLayout` 3-panel CSS Grid with resize handles
- `Canvas` scroll container with absolute-positioned nodes
- `NodeRenderer` recursive (static props only, no bindings)
- `SelectionOverlay` wired to `selectNode`
- `CanvasToolbar` with zoom + undo/redo
- **Exit:** Programmatically insert a Button node; it renders; click selects it

### Phase 3 — Drag & Drop

- `DndContext` at app root with pointer + keyboard sensors
- `ComponentPalette` + `PaletteItem` draggables
- Canvas drop handling → `addNode`
- `DragHandle` per node → canvas reposition
- Container drop zones with insert-line indicators
- `ComponentTree` + tree-level sorting
- **Exit:** Drag Button from palette → canvas; reposition; tree reflects hierarchy

### Phase 4 — Props Panel

- `PropsPanel` dispatching to all field type editors
- All field types: String, Number, Boolean, Color, Enum
- onChange → `updateProps` in store → live update on canvas
- Built-in component renderers responding to real props
- `BindingIndicator` (read-only state indicator for now)
- **Exit:** Select Button, change label in Props Panel → canvas updates live

### Phase 5 — Bindings Engine

- `expression-sandbox.ts` with memoized compile cache
- `context-builder.ts` + `binding-evaluator.ts`
- `ExpressionEditor` with lazy-loaded Monaco (dark theme, JS mode)
- `BindingsPanel` (expression tab) wired to store
- `DataSourcePicker` with DataSource CRUD + path picker
- `data-source-runner.ts` for REST polling
- **Exit:** Expression binding `"Hello " + ctx.props.suffix` evaluates live on canvas

### Phase 6 — MVP Polish

- Keyboard shortcuts (Delete, Ctrl+Z/Y, Escape)
- Context menus on canvas nodes (duplicate, delete, lock)
- Preview mode toggle (no overlays, live interactions)
- Error boundaries around NodeRenderer and binding evaluation
- Empty canvas drop hint
- JSON export/import of full editor state
- Zod validation at component registration time

---

## Critical Files (build order)

1. `src/types/index.ts` — all types, written first
2. `src/registry/index.ts` — registry singleton
3. `src/store/index.ts` — store with all slices
4. `src/canvas/NodeRenderer.tsx` — core canvas rendering
5. `src/engine/binding-evaluator.ts` — binding runtime

---

## Architectural Risks

- **Expression sandbox security**: `new Function` is acceptable for single-user local MVP; use SES/Compartment for multi-user/shared future
- **Monaco bundle size**: lazy-load via `React.lazy` + dynamic import; only loads when bindings panel opens
- **Undo/redo memory**: whole-tree snapshots, capped at 50; upgrade path is Immer patches if needed
- **Binding evaluation perf**: memoize compiled function objects by expression string key

---

## Verification Plan

1. `npm run dev` — editor loads, 3-panel layout visible
2. Drag "Button" from palette → drops on canvas at pointer position
3. Click canvas node → Props Panel shows Button's props
4. Change "label" field → canvas button text updates immediately
5. Click binding icon on "label" → Bindings panel opens
6. Enter expression `"Hello " + "World"` → canvas shows "Hello World"
7. Add REST data source pointing to a public API → bind a Text node's content to a path → content updates after fetch
8. Undo (Ctrl+Z) → last action reverts
9. Toggle preview mode → selection overlays disappear, buttons are clickable
10. JSON export → copy to clipboard → clear canvas → JSON import → state restored
