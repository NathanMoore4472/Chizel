import React, { useCallback, useRef } from 'react'
import { cn } from '@/utils/cn'

interface Props {
  onResize: (delta: number) => void
  direction?: 'horizontal' | 'vertical'
  className?: string
}

export default function ResizeHandle({ onResize, direction = 'horizontal', className }: Props) {
  const dragging = useRef(false)
  const startPos = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const pos = direction === 'horizontal' ? e.clientX : e.clientY
      const delta = pos - startPos.current
      startPos.current = pos
      onResize(delta)
    }

    const onMouseUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [direction, onResize])

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'flex-shrink-0 bg-editor-border hover:bg-editor-accent transition-colors cursor-col-resize',
        direction === 'horizontal' ? 'w-px hover:w-0.5' : 'h-px hover:h-0.5 cursor-row-resize',
        className
      )}
    />
  )
}
