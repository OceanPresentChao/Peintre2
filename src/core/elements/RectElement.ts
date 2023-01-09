import { CanvasElement } from './CanvasElement'
import type { ContextStyle, Position } from '@/types'

export class RectElement extends CanvasElement {
  constructor(layer: string, style: ContextStyle) {
    super('rect', layer, style)
  }

  render(context: CanvasRenderingContext2D) {
    renderRect(context, this)
  }

  addPosition(position: Position) {
    this.positions.push(position)
  }

  setStartPosition(position: Position) {
    this.positions[0] = position
  }

  setEndPosition(position: Position) {
    this.positions[1] = position
  }

  static deserialize(data: string): RectElement {
    const oldObj = JSON.parse(data) as RectElement
    const el = new RectElement(oldObj.layer, oldObj.style)
    Object.assign(el, oldObj)
    return el
  }
}

export function renderRect(context: CanvasRenderingContext2D, instance: RectElement) {
  if (instance.positions.length !== 2)
    return
  const startAxis = instance.positions[0]
  const endAxis = instance.positions[1]
  context.save()
  Object.assign(context, instance.style)
  context.beginPath()
  context.moveTo(startAxis.x, startAxis.y)
  context.rect(startAxis.x, startAxis.y, endAxis.x - startAxis.x, endAxis.y - startAxis.y)
  context.closePath()
  context.stroke()
  context.fill()
  context.restore()
}

