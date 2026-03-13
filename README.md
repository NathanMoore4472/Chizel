# Chizel — Visual Web Development Editor

A visual editor for building React component UIs via drag-and-drop. Components are rendered live on a canvas, props are edited through a properties panel, and values can be bound to JavaScript expressions or external data sources. Projects are saved as `.chizel` JSON files.

---

## Quick Start

```bash
npm install
npm run dev          # browser dev server (localhost:5173)
npm run tauri:dev    # native desktop app (requires Rust)
npm run build        # production web build
npm run tauri:build  # production desktop build
```

**Prerequisites for desktop:** Rust must be installed (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`).

---

## Interface

```
┌─────────────────────────────────────────────────────┐
│  ◈ CHIZEL   File ▾  untitled.chizel                 │  ← Header
├──────────────┬──────────────────┬────────────────────┤
│  Components  │  Canvas Toolbar  │  Props / Events    │
│  ──────────  │  ─────────────── │  ──────────────    │
│  [palette]   │                  │  [property panel]  │
│              │    Canvas        │                    │
│  Layers      │                  │                    │
│  ──────────  │                  │                    │
│  [tree]      │                  │                    │
└──────────────┴──────────────────┴────────────────────┘
```

| Panel | Purpose |
|---|---|
| **Components** (top-left) | Drag components onto the canvas |
| **Layers** (bottom-left) | Component hierarchy tree, right-click for context menu |
| **Canvas** | Live preview; click to select, drag to place |
| **Props tab** | Edit selected component's properties |
| **Events tab** | Add onClick, onChange and other event handlers |

---

## Core Concepts

### Frame

Every view has exactly one root **Frame** — the canvas background. It is always present and cannot be deleted. Select it in the Layers panel to configure:

- **Layout → Free (x/y):** components are placed at absolute pixel positions
- **Layout → Flex:** components flow in flex layout (direction, gap, alignment)
- **Background, padding** and all other visual properties

The Frame's **Custom Props** define the *parameters* of the view — values that can be passed in when the view is embedded inside another view.

### Components

Drop components from the palette onto the canvas. Components can be nested inside containers by hovering over the container while dragging.

### Selecting & Moving

- **Click** a component to select it
- **↑ / ↓ buttons** in the toolbar reorder the selected component within its siblings
- **Drag handle** in the Layers tree to reorder
- **Right-click** in the Layers tree for Cut / Copy / Paste Into / Delete

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` or `Cmd+Y` | Redo |
| `Cmd+C` | Copy selected component |
| `Cmd+X` | Cut selected component |
| `Cmd+V` | Paste into selected (or root Frame) |
| `Delete` / `Backspace` | Delete selected component |
| `Cmd+S` | Save (Tauri only) |
| `Cmd+Shift+S` | Save As (Tauri only) |
| `Cmd+O` | Open file (Tauri only) |

---

## Component Reference

### Basic

| Component | Key Props | Notes |
|---|---|---|
| **Text** | `content`, `tag` (p/h1–h3/span), `fontSize`, `color` | Rendered as the chosen HTML tag |
| **Label** | `text`, `fontSize`, `color`, `fontWeight`, `uppercase` | Lightweight text for form labels and captions |
| **Button** | `label`, `variant` (primary/secondary/danger/ghost), `disabled`, `fullWidth` | Fires `onClick` event |
| **Badge** | `text`, `variant` (default/success/warning/danger/info), `borderRadius` | Inline status chip |
| **Image** | `src`, `alt`, `width`, `height`, `objectFit`, `borderRadius`, `fullWidth` | Shows placeholder when src is empty |
| **Divider** | `orientation`, `color`, `thickness`, `margin`, `label` | Horizontal or vertical rule; optional centred label |

### Form

| Component | Key Props | Notes |
|---|---|---|
| **Input** | `label`, `placeholder`, `value`, `type`, `disabled`, `fullWidth` | Fires `onChange`, `onFocus`, `onBlur` |
| **Select** | `label`, `placeholder`, `options` (comma-separated), `disabled`, `fullWidth` | Fires `onChange` |

### Layout

| Component | Key Props | Notes |
|---|---|---|
| **Container** | `padding`, `background`, `borderRadius`, `border`, `fullWidth`, `fullHeight` | Generic block container |
| **Stack** | `direction`, `gap`, `padding`, `align`, `justify` | Flex column or row |
| **FlexContainer** | `direction`, `wrap`, `alignItems`, `justifyContent`, `gap`, `padding`, `width`, `height` | Full flex control |
| **Grid** | `columns`, `gap`, `padding`, `templateColumns` | CSS Grid |
| **Card** | `title`, `padding`, `background`, `borderColor`, `borderRadius`, `shadow` | Bordered card with optional header |
| **Spacer** | `size`, `flex` | Fixed-size or flex-grow empty space |
| **EmbeddedView** | `src` | Embeds another `.chizel` file; see [Embedded Views](#embedded-views) |
| **FlexRepeater** | `viewPath`, `instances`, `direction`, `gap`, `wrap` | Repeats a view for each item in an array; see [FlexRepeater](#flexrepeater) |

---

## Properties Panel

Select any component to edit its properties. Every prop shows a **⚡ binding icon** — click it to open the Bindings panel and bind the prop to an expression or data source.

### Custom Props

Add arbitrary props to any component via the **Custom Props** section. Supported types:

| Type | Editor | Usage in expressions |
|---|---|---|
| `string` | Text input | `ctx.props.myProp` |
| `number` | Number + slider | `ctx.props.count + 1` |
| `boolean` | Toggle | `ctx.props.isActive` |
| `array` | JSON textarea | `ctx.props.items.length` |
| `object` | JSON textarea | `ctx.props.config.title` |

Custom prop values are readable by child components via `ctx.parent.props.myProp`.

### Style Section

Every component has an extra **Style** section at the bottom of the Props panel:

- **Extra Classes** — space-separated Tailwind or custom CSS classes applied to the component wrapper (`shadow-lg rounded-xl opacity-80`)
- **Custom CSS** — raw CSS property:value pairs scoped to this component element (supports pseudo-elements, hover, media queries)

```css
color: red;
border: 2px dashed blue;
transition: all 0.3s;
```

---

## Bindings

Bindings replace a static prop value with a live-evaluated JavaScript expression or a data source value.

### Expression Bindings

Click **⚡** on any prop → **Expression** tab. Write JavaScript with access to the `ctx` object.

**Single expression** — no `return` needed:
```js
ctx.props.firstName + " " + ctx.props.lastName
```

**Multi-line block** — use `const`/`let`/`if`, but add explicit `return`:
```js
const items = ctx.props.items;
const active = items.filter(i => i.enabled);
return active.length;
```

### The `ctx` Object

```ts
ctx.props          // current node's own props (including custom props)
ctx.parent         // parent node snapshot: { id, type, props, index }
ctx.parent.props   // parent's props — reactive, re-evaluates when parent changes
ctx.children       // array of child snapshots: [{ id, type, props, index }]
ctx.node           // current node: { id, type, parentId, index }
ctx.sources        // data sources by name: ctx.sources.myApi
ctx.env.now        // current timestamp (ms)
ctx.env.url        // current window URL
```

### Data Source Bindings

Click **⚡** on any prop → **Data Source** tab.

1. Click **+** to add a REST data source (URL, method, optional polling interval)
2. Select the source, enter a JSONPath (e.g. `$.results[0].name`)
3. The value updates automatically after each fetch

---

## Events

Select a component → **Events** tab. Click **+** to add an event handler.

Recommended events are shown first (e.g. `onClick` for Button). You can also type any custom DOM event name.

Write JavaScript in the textarea — `ctx` and `event` are available:

```js
// Simple log
console.log('clicked:', ctx.props.label)

// Mutate props reactively
ctx.actions.setProps({ count: ctx.props.count + 1 })

// Update a parent's prop
ctx.actions.setProps(ctx.parent.id, { title: 'Updated' })

// Update any node by id
ctx.actions.setProps('some-node-id', { active: false })
```

Events only fire in **Preview mode** (toggle with the toolbar button or `Cmd+P`). In Edit mode, clicks are intercepted for selection.

> `ctx.actions.setProps(patch)` updates the current node.
> `ctx.actions.setProps(nodeId, patch)` updates any node by ID.

---

## Embedded Views

A view can be embedded inside another view, forming a reusable component system similar to Figma components or Ignition Perspective's Embedded Views.

### Defining Parameters

In the view you want to make reusable:
1. Select the **Frame** in the Layers panel
2. Add **Custom Props** — these become the view's input parameters (e.g. `title: string`, `count: number`)
3. Inside the view, bind components to `ctx.props.title` etc.
4. Save as a `.chizel` file

### Using EmbeddedView

1. Drop an **EmbeddedView** component onto the canvas
2. Set **src** to the `.chizel` file path
3. The Props panel automatically discovers the embedded view's parameters and shows them as editable fields
4. Fill in values, or bind them to expressions / data sources

Parameters are also available in the embedded view's expressions as `ctx.props.paramName`.

---

## FlexRepeater

Renders an embedded view once for each item in an array — ideal for lists, grids, and data-driven layouts.

### Setup

1. Build an item view with the Frame's Custom Props as its parameters (e.g. `name: string`, `age: number`)
2. Drop a **FlexRepeater** onto the canvas
3. Set **viewPath** to the item view's `.chizel` file
4. Set **instances** to a JSON array or bind it to a data source:
   ```json
   [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
   ```
5. Configure **direction** (Vertical / Horizontal), **gap**, **wrap**, etc.

### Instance Context

Each rendered instance receives its object's key-value pairs as `ctx.props.*` plus `ctx.props._index` (0-based position within the repeater).

```js
// In an item view — alternate row colours
ctx.props._index % 2 === 0 ? '#1e1e1e' : '#252526'
```

---

## File Format

Projects are saved as `.chizel` JSON files containing:

```json
{
  "tree": [ /* ComponentNode array */ ],
  "dataSources": [ /* DataSource array */ ]
}
```

`.chizel` files are plain JSON — safe to version control and diff. They are excluded from the Git repository by `.gitignore`.

---

## Desktop App (Tauri)

The desktop app wraps the same Vite/React frontend in a native window using Tauri v2 (WebKit on macOS).

```bash
npm run tauri:dev    # development
npm run tauri:build  # production dmg/exe
```

**File operations** are available via the **File** menu in the header (only visible in Tauri):

| Action | Shortcut |
|---|---|
| New Project | `Cmd+N` |
| Open… | `Cmd+O` |
| Save | `Cmd+S` |
| Save As… | `Cmd+Shift+S` |

The app has permission to read/write any file the OS user can access.

> **Note:** Tauri capabilities changes (in `src-tauri/capabilities/`) require a full `tauri:dev` restart to take effect — they are compiled into the binary.

---

## Architecture

```
src/
├── canvas/          # Canvas rendering (NodeRenderer, SelectionOverlay, CanvasToolbar)
├── engine/          # Binding evaluator, expression sandbox, view loader, event executor
├── hooks/           # useSelectedNode, useBindingContext, useDataSource
├── layout/          # AppLayout, LeftSidebar, RightSidebar, FileMenu
├── panels/
│   ├── bindings/    # BindingsPanel, ExpressionEditor (Monaco), DataSourcePicker
│   ├── palette/     # ComponentPalette, PaletteItem
│   ├── props/       # PropsPanel, PropField, field editors, EventsPanel
│   └── tree/        # ComponentTree, TreeNode (with context menu)
├── registry/        # Component registry + all built-in component definitions
├── store/           # Zustand + Immer store slices (tree, selection, history, clipboard…)
├── types/           # TypeScript interfaces
└── utils/           # tree-ops, id, cn, file-ops, deep-clone
```

### Key Design Decisions

| Concern | Approach |
|---|---|
| State | Zustand + Immer; undo/redo via whole-tree snapshots (max 50) |
| Drag & Drop | `@dnd-kit/core`; custom `innermostContainer` collision detection picks deepest droppable |
| Expression eval | `new Function` sandbox; memoised compile cache keyed by expression string |
| Bindings | Evaluated at render time in `NodeRenderer`; `ctx.parent` triggers re-render when parent props change |
| Events | Compiled at runtime; only execute in preview mode |
| Embedded views | File loaded via Tauri `readTextFile` (browser: `fetch`); module-level cache invalidated on save |

---

## Tech Stack

- **Vite 7** + **React 18** + **TypeScript**
- **Tailwind CSS 3** (dark IDE theme)
- **@dnd-kit** — drag and drop
- **Zustand + Immer** — state management
- **Monaco Editor** (lazy-loaded) — expression editing
- **Zod** — component definition validation
- **Tauri v2** — desktop wrapper (optional)
- **Lucide React** — icons
- **Radix UI** — context menus, accessible primitives
