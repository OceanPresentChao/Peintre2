import type { Position } from '@/types'
export function drawCircle(context: CanvasRenderingContext2D, position: Position, radius: number, fill = true) {
  const startAngle = 0
  const endAngle = Math.PI * 2
  const anticlockwise = true
  context.beginPath()
  context.moveTo(position.x, position.y)
  context.arc(position.x, position.y, radius, startAngle, endAngle, anticlockwise)
  context.closePath()
  context.stroke()
  if (fill)
    context.fill()
}

export function drawLine(context: CanvasRenderingContext2D, start: Position, end: Position) {
  context.beginPath()
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.y)
  context.stroke()
  context.closePath()
}

export function clientToCanvas(canvas: HTMLCanvasElement, position: Position): Position {
  const { left, top } = canvas.getBoundingClientRect()
  return {
    x: position.x - left,
    y: position.y - top,
  }
}
