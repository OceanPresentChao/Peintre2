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
  toolType: DrawType
  state: Map<string, DrawElement[]>
  currentLayer: Layer
  style: ContextStyle
  // 原点位置
  originPosition: Position
  // 记录鼠标最后操作的位置，注意lastStart、lastMove 、lastEnd是依次更新的
  mouseRecord: {
    lastStart: Position
    lastMove: Position
    lastEnd: Position
  }

  constructor(canvas: HTMLCanvasElement, _?: PainterBoardOptions) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.recordManager = new RecordManager()
    this.layerManager = new LayerManager()
    this.toolType = 'pencil'
    this.state = new Map()
    this.currentLayer = this.addLayer('layer1')
    this.style = defaultStyle
    this.setStyle(defaultStyle)
    this.originPosition = {
      x: 0,
      y: 0,
    }
    this.mouseRecord = {
      lastStart: { x: -1, y: -1 },
      lastMove: { x: -1, y: -1 },
      lastEnd: { x: -1, y: -1 },
    }
  }

  cleanCanvas(w = Number.MAX_SAFE_INTEGER) {
    this.context.clearRect(-(w / 2), -(w / 2), w, w)
  }

  render() {
    this.cleanCanvas()
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

  getCanvasOffset(): Position {
    const { left, top } = this.canvas.getBoundingClientRect()
    return {
      x: left,
      y: top,
    }
  }

  /**
   * 拖拽画布
   */
  dragCanvas(position: Position) {
    if (this.mouseRecord.lastMove.x >= 0 && this.mouseRecord.lastMove.y >= 0) {
      const translateX = position.x - this.mouseRecord.lastMove.x
      const translateY = position.y - this.mouseRecord.lastMove.y
      this.context.translate(translateX, translateY)
      this.originPosition.x += translateX
      this.originPosition.y += translateY
    }
  }

  clientToCanvas(position: Position): Position {
    const canvasOffset = this.getCanvasOffset()
    return {
      x: position.x - canvasOffset.x - this.originPosition.x,
      y: position.y - canvasOffset.y - this.originPosition.y,
    }
  }

  /**
   * 将画布原点重置为0,0。注意originPosition不会改变
   */
  resetOriginPosition() {
    this.context.translate(-this.originPosition.x, -this.originPosition.y)
  }

  /**
   * 根据originPosition移动画布原点。注意originPosition不会改变
   */
  translateOriginPosition() {
    this.context.translate(this.originPosition.x, this.originPosition.y)
  }
}
