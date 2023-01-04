import type { Position } from '@/types'

export function clientToCanvas(canvas: HTMLCanvasElement, position: Position): Position {
  const { left, top } = canvas.getBoundingClientRect()
  return {
    x: position.x - left,
    y: position.y - top,
  }
}
