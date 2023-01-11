import { EraserElement } from './EraserElement'
import { PencilElement } from './PencilElement'
import { LineElement } from './LineElement'
import { EllipseElement } from './EllipseElement'
import { RectElement } from './RectElement'
import type { CanvasElement } from './CanvasElement'
export function serializeElement(data: CanvasElement): string {
  return JSON.stringify(data)!
}

export function deserializeElement(data: string) {
  const obj = JSON.parse(data) as CanvasElement
  let el: CanvasElement | null = null
  switch (obj.type) {
    // 永远不会出现select类型的元素
    case 'select':
    case 'line':{
      el = new LineElement(obj.layer, obj.style)
      break
    }
    case 'rect':{
      el = new RectElement(obj.layer, obj.style)
      break
    }
    case 'ellipse':{
      el = new EllipseElement(obj.layer, obj.style)
      break
    }
    case 'text':
    case 'image':
    case 'pencil':{
      el = new PencilElement(obj.layer, obj.style)
      break
    }
    case 'eraser':{
      el = new EraserElement(obj.layer, obj.style)
      break
    }
  }
  Object.assign(el, obj)
  return el
}
