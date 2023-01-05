import { nanoid } from 'nanoid'
import type { DrawType } from '@/types'
export abstract class CanvasElement {
  id: string
  type: DrawType
  layer: string
  constructor(type: DrawType, layer: string) {
    this.id = nanoid()
    this.type = type
    this.layer = layer
  }
}
