import type { PencilElement } from '@/core/elements/PencilElement'
import type { EraserElement } from '@/core/elements/EraserElement'
export interface Position {
  x: number
  y: number
}

export type DrawType = 'line' | 'rect' | 'circle' | 'text' | 'image' | 'pencil' | 'eraser'

export type DrawElement = PencilElement | EraserElement

export interface Snapshot {
  id: string
  layers: Map<string, DrawElement[]>
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
