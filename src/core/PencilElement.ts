import { CanvasElement } from './CanvasElement'
import { drawCircle, drawLine } from './tool'
import type { Position } from '@/types'

export class PencilElement extends CanvasElement {
  positions: Position[] = []
  constructor(layer: number) {
    super('pencil', layer)
  }

  addPosition(position: Position) {
    this.positions.push(position)
  }

  render(context: CanvasRenderingContext2D) {
    renderPencil(context, this)
  }
}

export function renderPencil(context: CanvasRenderingContext2D, instance: PencilElement) {
  context.save()
  context.lineJoin = 'round'
  context.lineCap = 'round'
  drawCircle(context, instance.positions[0], context.lineWidth / 2, true)
  for (let i = 1; i < instance.positions.length; i++)
    drawLine(context, instance.positions[i - 1], instance.positions[i])
  drawCircle(context, instance.positions[instance.positions.length - 1], context.lineWidth / 2, true)
  context.restore()
}
