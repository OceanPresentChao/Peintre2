import type { PencilElement } from '@/core/PencilElement'
export interface Position {
  x: number
  y: number
}

export type DrawType = 'line' | 'rect' | 'circle' | 'text' | 'image' | 'pencil'

export type DrawElement = PencilElement

export interface Snapshot {
  id: string
  elements: DrawElement[]
}

export interface ContextStyle {
  lineWidth: number
  strokeStyle: string
  fillStyle: string
}
