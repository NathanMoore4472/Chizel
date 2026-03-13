import { createContext, useContext } from 'react'

/** When true, all editor chrome (selection overlays, drop highlights) is hidden.
 *  Provided by ViewerApp (always true) and toggled via the toolbar in the editor. */
export const PreviewContext = createContext(false)
export const useIsPreview = () => useContext(PreviewContext)
