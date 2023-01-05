import { cloneDeep } from 'lodash'
import { LayerManager } from './LayerManager'
import { RecordManager } from './RecordManager'
import { defaultStyle } from './common'
import type { ContextStyle, DrawElement, DrawType, Layer, Position } from '@/types'

interface PainterBoardOptions {

}
export class PainterBoard {
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  recordManager: RecordManager
  layerManager: LayerManager
  currentElement: DrawElement | null = null
  canvasOffset: Position
  toolType: DrawType
  state: Map<string, DrawElement[]>
  currentLayer: Layer
  style: ContextStyle

  constructor(canvas: HTMLCanvasElement, _?: PainterBoardOptions) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.recordManager = new RecordManager()
    this.layerManager = new LayerManager()
    const { left, top } = canvas.getBoundingClientRect()
    this.canvasOffset = {
      x: left,
      y: top,
    }
    this.toolType = 'pencil'
    this.state = new Map()
    this.currentLayer = this.addLayer('layer1')
    this.style = defaultStyle
    this.setStyle(defaultStyle)
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const layer of this.layerManager.iter()) {
      const els = this.state.get(layer.id)!
      els.forEach((el) => {
        el.render(this.context)
      })
    }
  }

  addPosition(position: Position) {
    if (this.currentElement)
      this.currentElement.addPosition(position)
  }

  addElement(el: DrawElement) {
    this.state.get(this.currentLayer.id)!.push(el)
  }

  addLayer(title = 'default') {
    const layer = this.layerManager.createLayer(title)
    this.layerManager.insertLayer(layer, this.layerManager.getSize())
    this.state.set(layer.id, [])
    return layer
  }

  setStyle(style: ContextStyle) {
    this.style = style
    Object.assign(this.context, style)
  }

  setCurrentLayer(id: string) {
    this.currentLayer = this.layerManager.findLayer(id)!
  }

  saveSnapshot() {
    this.recordManager.pushSnapshot(this.recordManager.createSnapshot(cloneDeep(this.state)))
  }
}
