import { nanoid } from 'nanoid'
import type { ContextStyle, DrawType, ElementRect, Position } from '@/types'

export abstract class CanvasElement {
  id: string
  type: DrawType
  layer: string
  style: ContextStyle
  positions: Position[] = []
  rect: ElementRect
  constructor(type: DrawType, layer: string, style: ContextStyle) {
    this.id = nanoid()
    this.type = type
    this.layer = layer
    this.style = style
    this.rect = {
      width: 0,
      height: 0,
      left: Infinity,
      right: -Infinity,
      top: Infinity,
      bottom: -Infinity,
    }
  }

  addPosition(position: Position) {
    this.positions.push(position)
  }

  resetRect() {
    this.rect = {
      width: 0,
      height: 0,
      left: Infinity,
      right: -Infinity,
      top: Infinity,
      bottom: -Infinity,
    }
  }

  updateRect(position: Position) {
    const { x, y } = position
    let { left, right, bottom, top } = this.rect
    if (x < left)
      left = x

    if (x > right)
      right = x

    if (y > bottom)
      bottom = y

    if (y < top)
      top = y

    this.rect = {
      left,
      right,
      bottom,
      top,
      width: Math.abs(right - left),
      height: Math.abs(bottom - top),
    }
  }

  abstract render(context: CanvasRenderingContext2D): void
}
