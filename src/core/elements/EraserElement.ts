import { CanvasElement } from './CanvasElement'
import type { ContextStyle, Position } from '@/types'

export class EraserElement extends CanvasElement {
  positions: Position[] = []
  constructor(layer: string, style: ContextStyle) {
    super('eraser', layer, style)
  }

  addPosition(position: Position) {
    this.positions.push(position)
  }

  render(context: CanvasRenderingContext2D) {
    renderEraser(context, this)
  }
}

export function renderEraser(context: CanvasRenderingContext2D, instance: EraserElement) {
  context.save()
  Object.assign(context, instance.style)
  for (let i = 1; i < instance.positions.length; i++)
    clearLine(context, instance.positions[i - 1], instance.positions[i], instance.style.lineWidth)
  context.restore()
}

function clearLine(context: CanvasRenderingContext2D, start: Position, end: Position, lineWidth: number) {
  const { x: sx, y: sy } = start
  const { x: ex, y: ey } = end
  // 获取鼠标起点和终点之间的矩形区域端点
  const r = lineWidth / 2
  const x1 = sx
  const y1 = sy - r
  const x2 = sx
  const y2 = sy + r
  const x3 = ex
  const y3 = ey + r
  const x4 = ex
  const y4 = ey - r
  // 清除开端圆形
  context.save()
  context.beginPath()
  context.arc(sx, sy, r, 0, 2 * Math.PI)
  context.closePath()
  context.clip()
  cleanContext(context)
  context.restore()

  // 清除矩形区域
  context.save()
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.lineTo(x3, y3)
  context.lineTo(x4, y4)
  context.lineTo(x1, y1)
  context.closePath()
  context.clip()
  cleanContext(context)
  context.restore()

  // 清除末端圆形
  context.save()
  context.beginPath()
  context.arc(ex, ey, r, 0, 2 * Math.PI)
  context.closePath()
  context.clip()
  cleanContext(context)
  context.restore()
}

function cleanContext(context: CanvasRenderingContext2D) {
  const w = Number.MAX_SAFE_INTEGER
  context.clearRect(-(w / 2), -(w / 2), w, w)
}
