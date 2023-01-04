import { History } from './History'
import type { DrawElement, DrawType, Position } from '@/types'
interface PainterBoardOptions {

}
export class PainterBoard {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  history: History
  currentElement: DrawElement | null = null
  canvasOffset: Position
  toolType: DrawType

  constructor(canvas: HTMLCanvasElement, config?: PainterBoardOptions) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.history = new History()
    const { left, top } = canvas.getBoundingClientRect()
    this.canvasOffset = {
      x: left,
      y: top,
    }
    this.toolType = 'pencil'
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const data = this.history.getCurrentData()
    if (data)
      this.context.putImageData(data.image, 0, 0)
  }

  addPosition(position: Position) {
    if (this.currentElement)
      this.currentElement.addPosition(position)
  }
}
