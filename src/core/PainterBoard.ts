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
  private offsetCanvas: HTMLCanvasElement
  private offsetContext: CanvasRenderingContext2D
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
    this.offsetCanvas = document.createElement('canvas')
    this.offsetContext = this.offsetCanvas.getContext('2d')!
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
    this.resizeCanvas()
    this.saveSnapshot()
  }

  cleanCanvas(context: CanvasRenderingContext2D = this.context) {
    const w = Number.MAX_SAFE_INTEGER
    context.clearRect(-(w / 2), -(w / 2), w, w)
  }

  render() {
    this.cleanCanvas()
    // index = 0为栈顶，故从栈底开始渲染
    for (let i = this.layerManager.layers.length - 1; i >= 0; i--)
      this.renderLayer(this.layerManager.layers[i].id)
  }

  renderLayer(id: string) {
    const layer = this.layerManager.findLayer(id)!
    const els = this.state.get(layer.id)!
    this.cleanCanvas(this.offsetContext)
    els.forEach((el) => {
      el.render(this.offsetContext)
    })
    this.context.drawImage(this.offsetCanvas, 0, 0)
  }

  // Position是相对于 画布原点为（0,0）时 的坐标。不受拖拽画布的影响
  addPosition(position: Position) {
    if (this.currentElement)
      this.currentElement.addPosition(position)
  }

  setStartPosition(position: Position) {
    if (this.currentElement)
      this.currentElement.positions[0] = position
  }

  setEndPosition(position: Position) {
    if (this.currentElement)
      this.currentElement.positions[1] = position
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

  setToolType(tool: DrawType) {
    this.toolType = tool
  }

  setCurrentLayer(id: string) {
    this.currentLayer = this.layerManager.findLayer(id)!
  }

  saveSnapshot() {
    this.recordManager.pushSnapshot(
      this.recordManager.createSnapshot(
        cloneDeep(this.layerManager.layers),
        cloneDeep(this.state),
      ),
    )
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
      this.offsetContext.translate(translateX, translateY)
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

  resizeCanvas(width?: number, height?: number) {
    if (width)
      this.canvas.width = width
    if (height)
      this.canvas.height = height
    this.offsetCanvas.width = this.canvas.width
    this.offsetCanvas.height = this.canvas.height
  }

  // 撤回操作可能导致painter的layers和当前state不同步
  // 将layers同步到state
  syncLayers() {
    this.layerManager.clear()
    const snap = this.recordManager.getCurrentSnapshot()
    if (snap) {
      snap.stack.forEach((layer) => {
        this.layerManager.insertLayer(layer, this.layerManager.getSize())
      })
    }
  }

  undo() {
    const snap = this.recordManager.backward()
    if (snap) {
      this.state = cloneDeep(snap.elements)
      // 只有图层数不同了才需要同步
      if (this.layerManager.getSize() !== snap.stack.length)
        this.syncLayers()
    }
  }

  redo() {
    const snap = this.recordManager.forward()
    if (snap) {
      this.state = cloneDeep(snap.elements)
      // 只有图层数不同了才需要同步
      if (this.layerManager.getSize() !== snap.stack.length)
        this.syncLayers()
    }
  }
}
