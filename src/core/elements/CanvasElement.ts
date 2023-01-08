import { nanoid } from 'nanoid'
import type { ContextStyle, DrawType, Position } from '@/types'

export abstract class CanvasElement {
  id: string
  type: DrawType
  layer: string
  style: ContextStyle
  positions: Position[] = []
  constructor(type: DrawType, layer: string, style: ContextStyle) {
    this.id = nanoid()
    this.type = type
    this.layer = layer
    this.style = style
  }

  abstract render(context: CanvasRenderingContext2D): void
}
