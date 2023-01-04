import { RecordManager } from './RecordManager'
import { defaultStyle } from './common'
import type { ContextStyle, DrawElement, DrawType, Position, Snapshot } from '@/types'
interface PainterBoardOptions {

}
export class PainterBoard {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  recordManager: RecordManager
  currentElement: DrawElement | null = null
  canvasOffset: Position
  toolType: DrawType
  state: Snapshot
  currentLayer: number
  style: ContextStyle

  constructor(canvas: HTMLCanvasElement, _?: PainterBoardOptions) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.recordManager = new RecordManager()
    const { left, top } = canvas.getBoundingClientRect()
    this.canvasOffset = {
      x: left,
      y: top,
    }
    this.toolType = 'pencil'
    this.state = this.recordManager.createSnapshot([])
    this.currentLayer = 0
    this.style = defaultStyle
    this.setStyle(defaultStyle)
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.state.elements.forEach((el) => {
      el.render(this.context)
    })
  }

  addPosition(position: Position) {
    if (this.currentElement)
      this.currentElement.addPosition(position)
  }

  addElement(el: DrawElement) {
    this.state.elements.push(el)
  }

  setStyle(style: ContextStyle) {
    this.style = style
    Object.assign(this.context, style)
  }
}
