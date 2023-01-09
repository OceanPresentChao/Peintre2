import { CanvasElement } from './CanvasElement'
import type { ContextStyle, Position } from '@/types'

export class PencilElement extends CanvasElement {
  constructor(layer: string, style: ContextStyle) {
    super('pencil', layer, style)
  }

  addPosition(position: Position) {
    this.positions.push(position)
  }

  render(context: CanvasRenderingContext2D) {
    renderPencil(context, this)
  }

  static deserialize(data: string): PencilElement {
    const oldObj = JSON.parse(data) as PencilElement
    const el = new PencilElement(oldObj.layer, oldObj.style)
    Object.assign(el, oldObj)
    return el
  }
}

export function renderPencil(context: CanvasRenderingContext2D, instance: PencilElement) {
  context.save()
  context.lineJoin = 'round'
  context.lineCap = 'round'
  Object.assign(context, instance.style)
  for (let i = 1; i < instance.positions.length; i++)
    drawLine(context, instance, i)
  context.restore()
}

/**
  1. 如果是前两个坐标，就通过lineTo连接即可
  2. 如果是前两个坐标之后的坐标，就采用贝塞尔曲线进行连接，比如现在有a, b, c 三个点，到c点时，把ab坐标的中间点作为起点,bc坐标的中间点作为终点，b点作为控制点进行连接
 */
function drawLine(context: CanvasRenderingContext2D, instance: PencilElement, i: number) {
  const { positions } = instance
  const { x: centerX, y: centerY } = positions[i - 1]
  const { x: endX, y: endY } = positions[i]
  context.beginPath()
  if (i === 1) {
    context.moveTo(centerX, centerY)
    context.lineTo(endX, endY)
  }
  else {
    const { x: startX, y: startY } = positions[i - 2]
    const lastX = (startX + centerX) / 2
    const lastY = (startY + centerY) / 2
    const x = (centerX + endX) / 2
    const y = (centerY + endY) / 2
    context.moveTo(lastX, lastY)
    context.quadraticCurveTo(centerX, centerY, x, y)
  }
  context.closePath()
  context.stroke()
}
