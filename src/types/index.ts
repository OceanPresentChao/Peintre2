import type { PencilElement } from '@/core/elements/PencilElement'
import type { EraserElement } from '@/core/elements/EraserElement'
import type { RectElement } from '@/core/elements/RectElement'
import type { EllipseElement } from '@/core/elements/EllipseElement'
import type { LineElement } from '@/core/elements/LineElement'
export interface Position {
  x: number
  y: number
}

export type DrawType = 'line' | 'rect' | 'ellipse' | 'text' | 'image' | 'pencil' | 'eraser' | 'select'

export type DrawElement = PencilElement | EraserElement | RectElement | EllipseElement | LineElement

export interface Snapshot {
  id: string
  stack: Layer[]
  elements: Map<string, DrawElement[]>
}

export interface Layer {
  id: string
  title: string
  show: boolean
}

export interface ContextStyle {
  lineWidth: number
  strokeStyle: string
  fillStyle: string
}

export interface StorageState {
  snap: {
    id: string
    stack: Layer[]
    elements: [string, DrawElement[]][]
  }
  toolType: DrawType
  style: ContextStyle
  originPosition: Position
}

export type TransformType = 'move' | 'null' | 'left-bottom' | 'right-bottom' | 'left-top' | 'right-top'

export interface ElementRect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export type CursorType = 'auto' | 'move' | 'nesw-resize' | 'nwse-resize' | 'grab' | 'grabbing' | 'pointer'
