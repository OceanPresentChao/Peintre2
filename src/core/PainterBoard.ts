import { cloneDeep } from 'lodash'
import { LayerManager } from './LayerManager'
import { RecordManager } from './RecordManager'
import { SelectElement } from './select'
import { KEY_PREFIX, defaultStyle } from './common'
import { Storage } from './storage'
import { Cursor } from './cursor'
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

  select: SelectElement
  cursor: Cursor

  version = '0.0.1'

  constructor(canvas: HTMLCanvasElement, _?: PainterBoardOptions) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.offsetCanvas = document.createElement('canvas')
    this.offsetContext = this.offsetCanvas.getContext('2d')!
    this.recordManager = new RecordManager()
    this.layerManager = new LayerManager()
    this.select = new SelectElement(this)
    this.cursor = new Cursor(this.canvas)
    this.toolType = 'pencil'
    this.state = new Map()
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
    if (!this.hasCache()) {
      // 先存储一张空白的快照
      this.currentLayer = this.addLayer('layer1')
      this.saveSnapshot()
    }
    else {
      this.loadCache()
      this.currentLayer = this.layerManager.findLayer(0)!
    }
    this.render()
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
    if (this.select.selectElIndex !== -1)
      this.select.renderResizeRect()
  }

  renderLayer(id: string) {
    const layer = this.layerManager.findLayer(id)!
    const els = this.state.get(layer.id)!
    this.cleanCanvas(this.offsetContext)
    els.forEach((el) => {
      el.render(this.offsetContext)
    })
    this.context.drawImage(this.offsetCanvas, -this.originPosition.x, -this.originPosition.y)
  }

  // Position是相对于 画布原点为（0,0）时 的坐标。不受拖拽画布的影响
  addPosition(position: Position) {
    if (this.currentElement) {
      this.currentElement.addPosition(position)
      this.currentElement.updateRect(position)
    }
  }

  setStartPosition(position: Position) {
    if (this.currentElement) {
      this.currentElement.positions[0] = position
      this.currentElement.updateRect(position)
    }
  }

  setEndPosition(position: Position) {
    if (this.currentElement) {
      this.currentElement.positions[1] = position
      this.currentElement.resetRect()
      this.currentElement.positions.forEach((p) => {
        this.currentElement?.updateRect(p)
      })
    }
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

  removeLayer(layerId: string) {
    if (this.state.size > 1)
      this.layerManager.removeLayer(layerId)
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

  /**
   * 将client坐标转换为在考虑了原点偏移后的canvas中绘制的坐标（基于(0,0)原点）
   * @param position
   * @returns Position
   */
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
    const snap = this.recordManager.getCurrentSnapshot()
    if (snap) {
      this.layerManager.layers = cloneDeep(snap.stack)
      this.layerManager.initMap()
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

  /**
   * 本地存储的需要转换成标准的JSON格式，存储的cache格式如下
   * 关键在于snap的elements从map转换成数组了
   * interface StorageState
  }
   */
  cache() {
    const snap = this.recordManager.getCurrentSnapshot()
    const state: Record<string, any> = {
      snap: snap ? this.recordManager.serializeSnap(snap) : -1,
      toolType: this.toolType,
      style: this.style,
      originPosition: this.originPosition,
    }
    Storage.setStorage(KEY_PREFIX + this.version, JSON.stringify(state))
  }

  loadCache() {
    const obj: Record<string, any> = JSON.parse(Storage.getStorage(KEY_PREFIX + this.version) || '{}')
    if (typeof obj.snap === 'string') {
      obj.snap = this.recordManager.deserializeSnap(obj.snap)
      this.state = obj.snap.elements
      this.layerManager.layers = obj.snap.stack
      this.toolType = obj.toolType
      this.originPosition = obj.originPosition
      this.translateOriginPosition()
      this.setStyle(obj.style)
      this.saveSnapshot()
      this.syncLayers()
    }
  }

  hasCache() {
    return !!Storage.getStorage(KEY_PREFIX + this.version)
  }
}
