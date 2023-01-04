import type { CanvasElement } from './CanvasElement'
interface HistoryData {
  element: CanvasElement
  image: ImageData
}
export class History {
  dataStack: HistoryData[] = []
  index: number
  constructor() {
    this.index = -1
  }

  pushData(data: HistoryData) {
    this.dataStack.push(data)
  }

  backward() {
    if (this.index >= 0)
      this.index--

    if (this.index >= 0)
      return this.dataStack[this.index]
    else
      return null
  }

  forward() {
    if (this.index < this.dataStack.length - 1) {
      this.index++
      return this.dataStack[this.index]
    }
    else {
      return null
    }
  }

  getCurrentData() {
    if (this.index >= 0 && this.index < this.dataStack.length)
      return this.dataStack[this.index]
    else
      return null
  }
}
