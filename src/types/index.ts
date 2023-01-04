import type { PencilElement } from '@/core/PencilElement'
export interface Position {
  x: number
  y: number
}

export type DrawType = 'line' | 'rect' | 'circle' | 'text' | 'image' | 'pencil'

export type DrawElement = PencilElement
