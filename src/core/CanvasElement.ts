import { nanoid } from 'nanoid'
import type { DrawType } from '@/types'
export abstract class CanvasElement {
  id: string
  type: DrawType
  layer: number
  constructor(type: DrawType, layer: number) {
    this.id = nanoid()
    this.type = type
    this.layer = layer
  }
}
