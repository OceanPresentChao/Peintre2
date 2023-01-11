import type { PainterBoard } from './PainterBoard'
import { isInsideRect, movePoint, pointDistance, pointToLineDist } from './tool'
import { RECT_MIN_SIZE, selectRectStyle } from './common'
import { getResizeCursorType } from '@/core/cursor'
import type { DrawElement, ElementRect, Position, TransformType } from '@/types'
export class SelectElement {
  board: PainterBoard
  hoverElIndex: number
  selectElIndex: number
  transformType: TransformType
  constructor(board: PainterBoard) {
    this.board = board
    this.hoverElIndex = this.selectElIndex = -1
    this.transformType = 'null'
  }

  hoverSelectElement(position: Position) {
    const candidates = this.getCandidateElements()
    let flag = false
    // 寻找hover到的元素
    for (let i = 0; i < candidates.length; i++) {
      if (this.isTouched(position, candidates[i])) {
        flag = true
        this.hoverElIndex = i
        this.board.cursor.set('pointer')
        break
      }
    }
    // 如果当前已选中了元素，根据transformType修改鼠标样式
    if (this.selectElIndex !== -1) {
      const originPos = movePoint(position, this.board.originPosition)
      const transformType = this.getResizeType(
        originPos,
        this.getSelectedElement()!.rect,
        this.getSelectedElement()!.style.lineWidth / 2 < 10 ? 10 : this.getSelectedElement()!.style.lineWidth / 2,
      )
      this.transformType = transformType
      const cursor = getResizeCursorType(this.transformType)
      this.board.cursor.set(cursor)
    }
    if (!flag)
      this.hoverElIndex = -1

    // 既没有hover到元素，也没有选中元素，鼠标样式为默认
    if (!flag && this.selectElIndex === -1)
      this.board.cursor.set('auto')
  }

  clickElement(position: Position) {
    const originPos = movePoint(position, this.board.originPosition)
    // 如果已经有选择了的元素，判断当前的点击位置
    if (this.selectElIndex !== -1) {
      const transformType = this.getResizeType(
        originPos,
        this.getSelectedElement()!.rect,
        this.getSelectedElement()!.style.lineWidth / 2 < 10 ? 10 : this.getSelectedElement()!.style.lineWidth / 2,
      )
      this.transformType = transformType
      const cursor = getResizeCursorType(this.transformType)
      this.board.cursor.set(cursor)

      if (this.transformType === 'null') {
        // 点击其他元素
        if (this.hoverElIndex !== -1)
          this.selectElIndex = this.hoverElIndex
        else
        // 点击空白处，取消选择
          this.cancelSelect()
      }
    }
    else {
      if (this.hoverElIndex !== -1)
        this.selectElIndex = this.hoverElIndex
    }
  }

  moveSelectedElement(offset: Position) {
    const el = this.getSelectedElement()
    if (el) {
      el.resetRect()
      el.positions.forEach((pos) => {
        pos.x += offset.x
        pos.y += offset.y
        el.updateRect(pos)
      })
    }
  }

  resizeSelectedElement(scaleX: number, scaleY: number) {
    const el = this.getSelectedElement()
    if (el && this.transformType !== 'move' && this.transformType !== 'null') {
      const oldRect = el.rect
      // 宽度和高度小到一定程度就禁止缩小
      if ((oldRect.width <= RECT_MIN_SIZE && scaleX < 1)
    || (oldRect.height <= RECT_MIN_SIZE && scaleY < 1))
        return

      switch (el.type) {
        case 'pencil':
        case 'eraser':{
          el.resetRect()
          el.positions.forEach((pos) => {
            pos.x *= scaleX
            pos.y *= scaleY
            el.updateRect(pos)
          })
          const offsetX = el.rect.left - oldRect.left
          const offsetY = el.rect.top - oldRect.top

          el.resetRect()
          el.positions.forEach((pos) => {
            pos.x -= offsetX
            pos.y -= offsetY
            el.updateRect(pos)
          })
          break
        }
        case 'line':
        case 'rect':{
          const maxXP = el.positions[0].x > el.positions[1].x ? el.positions[0] : el.positions[1]
          const maxYP = el.positions[0].y > el.positions[1].y ? el.positions[0] : el.positions[1]
          const minXP = el.positions[0].x < el.positions[1].x ? el.positions[0] : el.positions[1]
          const minYP = el.positions[0].y < el.positions[1].y ? el.positions[0] : el.positions[1]
          switch (this.transformType) {
            case 'left-bottom':{
              maxXP.x *= scaleX
              minYP.y *= scaleY
              break
            }
            case 'right-bottom':{
              minXP.x *= scaleX
              minYP.y *= scaleY
              break
            }
            case 'left-top':{
              maxXP.x *= scaleX
              maxYP.y *= scaleY
              break
            }
            case 'right-top':{
              minXP.x *= scaleX
              maxYP.y *= scaleY
              break
            }
          }
          el.resetRect()
          el.positions.forEach((p) => {
            el.updateRect(p)
          })
          break
        }
        case 'ellipse':
        case 'text':
        case 'image':
        case 'select':{
          break
        }
      }
    }
  }

  cancelSelect() {
    this.selectElIndex = -1
  }

  getSelectedElement() {
    if (this.selectElIndex < 0)
      return null
    const els = this.board.state.get(this.board.currentLayer.id) || []
    return els[this.selectElIndex]
  }

  private getCandidateElements() {
    if (this.board.currentLayer.show)
      return this.board.state.get(this.board.currentLayer.id) || []
    return []
  }

  private isTouched(position: Position, element: DrawElement) {
    const threshold = element.style.lineWidth / 2 < 10 ? 10 : element.style.lineWidth / 2
    switch (element.type) {
      case 'line':{
        return this.isTouchLine(position, {
          start: element.positions[0],
          end: element.positions[1],
        }, threshold)
      }
      case 'rect':{
        const line1 = {
          start: element.positions[0],
          end: { x: element.positions[1].x, y: element.positions[0].y },
        }
        const line2 = {
          start: element.positions[0],
          end: { x: element.positions[0].x, y: element.positions[1].y },
        }
        const line3 = {
          start: element.positions[1],
          end: { x: element.positions[0].x, y: element.positions[1].y },
        }
        const line4 = {
          start: element.positions[1],
          end: { x: element.positions[1].x, y: element.positions[0].y },
        }
        return this.isTouchLine(position, line1, threshold)
        || this.isTouchLine(position, line2, threshold)
        || this.isTouchLine(position, line3, threshold)
        || this.isTouchLine(position, line4, threshold)
      }
      case 'ellipse':{
        const x = element.positions[0].x
        const y = element.positions[0].y
        const a = Math.abs(Math.round((element.positions[1].x - element.positions[0].x) / 2))
        const b = Math.abs(Math.round((element.positions[1].y - element.positions[0].y) / 2))
        const sub = (position.x - x) ** 2 / a ** 2 + (position.y - y) ** 2 / b ** 2
        return sub > 1 ? sub < 1.3 : sub > 0.5
      }
      case 'pencil':{
        for (let i = 1; i < element.positions.length; i++) {
          if (this.isTouchLine(position, { start: element.positions[i - 1], end: element.positions[i] }, threshold))
            return true
        }
        return false
      }
      case 'text':
      case 'image':
      case 'eraser':
      case 'select':{
        return false
      }
    }
  }

  private isTouchLine(position: Position, line: { start: Position; end: Position }, threshold: number) {
    const startDist = pointDistance(position, line.start)
    const endDist = pointDistance(position, line.end)
    const lineDist = pointToLineDist(position, {
      start: line.start,
      end: line.end,
    })
    const isValidX = Math.min(line.start.x, line.end.x) <= position.x
    && Math.max(line.start.x, line.end.x) >= position.x
    const isValidY = Math.min(line.start.y, line.end.y) <= position.y
    && Math.max(line.start.y, line.end.y) >= position.y
    return startDist <= threshold
    || endDist <= threshold
    || (lineDist <= threshold && isValidX && isValidY)
  }

  /**
   * 获取变换类型
   * @param position
   * @param rect
   * @returns TransformType
   */
  getResizeType(position: Position, rect: ElementRect, threshold: number): TransformType {
    if (isInsideRect(position, rect)) {
      return 'move'
    }
    else {
      if (pointDistance(position, { x: rect.left, y: rect.top }) <= threshold)
        return 'left-top'
      if (pointDistance(position, { x: rect.left, y: rect.bottom }) <= threshold)
        return 'left-bottom'
      if (pointDistance(position, { x: rect.right, y: rect.top }) <= threshold)
        return 'right-top'
      if (pointDistance(position, { x: rect.right, y: rect.bottom }) <= threshold)
        return 'right-bottom'
    }
    return 'null'
  }

  renderResizeRect() {
    const el = this.getSelectedElement()
    if (el)
      drawResizeRect(this.board.context, el.rect)
  }
}

/**
 * 绘制拖拽矩形
 */
export function drawResizeRect(context: CanvasRenderingContext2D, rect: ElementRect) {
  const { left, top, width, height } = rect
  context.save()
  Object.assign(context, selectRectStyle)
  context.setLineDash([5])
  context.lineCap = 'round'
  context.lineJoin = 'round'
  // 绘制虚线框
  drawRect(context, left, top, width, height)
  // 绘制四角手柄
  drawRect(context, left - 10, top - 10, 10, 10, true)
  drawRect(context, left + width, top - 10, 10, 10, true)
  drawRect(context, left - 10, top + height, 10, 10, true)
  drawRect(context, left + width, top + height, 10, 10, true)
  context.restore()
}

function drawRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fill = false) {
  context.save()
  context.beginPath()
  context.rect(x, y, width, height)
  context.closePath()
  context.stroke()
  if (fill)
    context.fill()
  context.restore()
}

