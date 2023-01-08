import { nanoid } from 'nanoid'
import type { DrawElement, Layer, Snapshot } from '@/types'
export class RecordManager {
  snapStack: Snapshot[] = []
  index: number
  constructor() {
    this.index = -1
  }

  pushSnapshot(data: Snapshot) {
    this.snapStack.push(data)
    this.index++
  }

  backward() {
    if (this.index >= 0)
      this.index--
    if (this.index >= 0)
      return this.snapStack[this.index]
    else
      return null
  }

  forward() {
    if (this.index < this.snapStack.length)
      this.index++
    if (this.index < this.snapStack.length)
      return this.snapStack[this.index]
    else
      return null
  }

  getCurrentSnapshot() {
    if (this.index >= 0 && this.index < this.snapStack.length)
      return this.snapStack[this.index]
    else
      return null
  }

  createSnapshot(stack: Layer[], elements: Map<string, DrawElement[]>): Snapshot {
    return {
      id: nanoid(),
      stack,
      elements,
    }
  }
}
