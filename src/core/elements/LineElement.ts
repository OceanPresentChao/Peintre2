import { CanvasElement } from './CanvasElement'
import type { ContextStyle, Position } from '@/types'

export class LineElement extends CanvasElement {
  constructor(layer: string, style: ContextStyle) {
    super('line', layer, style)
  }

  render(context: CanvasRenderingContext2D) {
    renderLine(context, this)
  }

  setStartPosition(position: Position) {
    this.positions[0] = position
  }

  setEndPosition(position: Position) {
    this.positions[1] = position
  }

  static deserialize(data: string): LineElement {
    const oldObj = JSON.parse(data) as LineElement
    const el = new LineElement(oldObj.layer, oldObj.style)
    Object.assign(el, oldObj)
    return el
  }
}

export function renderLine(context: CanvasRenderingContext2D, instance: LineElement) {
  if (instance.positions.length !== 2)
    return
  const startAxis = instance.positions[0]
  const endAxis = instance.positions[1]
  context.save()
  Object.assign(context, instance.style)
  context.beginPath()
  context.moveTo(startAxis.x, startAxis.y)
  context.lineTo(endAxis.x, endAxis.y)
  context.closePath()
  context.stroke()
  context.restore()
}

