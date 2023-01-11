import type { CursorType, TransformType } from '@/types'
export class Cursor {
  element: HTMLElement
  type: CursorType
  constructor(el: HTMLElement) {
    this.element = el
    this.type = 'auto'
  }

  reset() {
    this.type = 'auto'
    this.element.style.cursor = 'auto'
  }

  set(type: CursorType) {
    this.type = type
    this.element.style.cursor = type
  }
}

/**
 * 根据当前手柄类型获取鼠标光标
 * @param resizeType // 手柄类型
 */
export function getResizeCursorType(resizeType: TransformType): CursorType {
  switch (resizeType) {
    case 'null':{
      return 'auto'
    }
    case 'move':{
      return 'move'
    }
    case 'right-top':
    case 'left-bottom':{
      return 'nesw-resize'
    }
    case 'left-top':
    case 'right-bottom':{
      return 'nwse-resize'
    }
  }
}
