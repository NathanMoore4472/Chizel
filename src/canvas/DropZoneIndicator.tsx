import React from 'react'

interface Props {
  visible: boolean
  horizontal?: boolean
}

export default function DropZoneIndicator({ visible, horizontal = false }: Props) {
  if (!visible) return null
  return (
    <div
      className={`absolute bg-blue-500 opacity-80 pointer-events-none z-50 rounded-full ${
        horizontal ? 'left-0 right-0 h-0.5' : 'top-0 bottom-0 w-0.5'
      }`}
    />
  )
}
