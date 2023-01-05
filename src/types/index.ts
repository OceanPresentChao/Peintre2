import type { PencilElement } from '@/core/PencilElement'
export interface Position {
  x: number
  y: number
}

export type DrawType = 'line' | 'rect' | 'circle' | 'text' | 'image' | 'pencil'

export type DrawElement = PencilElement

export interface Snapshot {
  id: string
  layers: Map<string, DrawElement[]>
}

export interface Layer {
  id: string
  title: string
  show: boolean
}

export interface LinkNode<T> {
  el: T
  next: LinkNode<T> | null
  prev: LinkNode<T> | null
}

export interface ContextStyle {
  lineWidth: number
  strokeStyle: string
  fillStyle: string
}
