import { nanoid } from 'nanoid'
import type { DrawElement, Snapshot } from '@/types'
export class RecordManager {
  snapStack: Snapshot[] = []
  index: number
  constructor() {
    this.index = -1
  }

  pushData(data: Snapshot) {
    this.snapStack.push(data)
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
    if (this.index < this.snapStack.length - 1) {
      this.index++
      return this.snapStack[this.index]
    }
    else {
      return null
    }
  }

  getCurrentSnapshot() {
    if (this.index >= 0 && this.index < this.snapStack.length)
      return this.snapStack[this.index]
    else
      return null
  }

  createSnapshot(elements: DrawElement[]): Snapshot {
    return {
      id: nanoid(),
      elements,
    }
  }
}
