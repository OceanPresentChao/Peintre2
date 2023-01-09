import { CanvasElement } from './CanvasElement'
import type { ContextStyle, Position } from '@/types'

export class EllipseElement extends CanvasElement {
  constructor(layer: string, style: ContextStyle) {
    super('ellipse', layer, style)
  }

  render(context: CanvasRenderingContext2D) {
    renderEllipse(context, this)
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

  serialize(): string {
    return JSON.stringify(this)
  }

  static deserialize(data: string): EllipseElement {
    const oldObj = JSON.parse(data) as EllipseElement
    const el = new EllipseElement(oldObj.layer, oldObj.style)
    Object.assign(el, oldObj)
    return el
  }
}

export function renderEllipse(context: CanvasRenderingContext2D, instance: EllipseElement) {
  if (instance.positions.length !== 2)
    return
  const startAxis = instance.positions[0]
  const endAxis = instance.positions[1]
  context.save()
  Object.assign(context, instance.style)
  context.beginPath()
  context.moveTo(startAxis.x, startAxis.y)
  context.ellipse(startAxis.x, startAxis.y, Math.abs(Math.round((endAxis.x - startAxis.x) / 2)), Math.abs(Math.round((endAxis.y - startAxis.y) / 2)), 0, 0, Math.PI * 2)
  context.closePath()
  context.stroke()
  context.fill()
  context.restore()
}

