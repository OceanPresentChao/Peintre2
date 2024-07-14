import { nanoid } from 'nanoid'
import type { Layer } from '@/types'
export class LayerManager {
  // 可以看做是一个栈，index = 0 为栈顶
  layers: Layer[] = []
  private map: Map<string, Layer>
  constructor() {
    this.map = new Map()
  }

  // insert 1: a b c -> a 1 b c
  insertLayer(layer: Layer, index: number) {
    if (index < 0 || index > this.layers.length)
      throw new Error('index out of range')
    this.layers.splice(index, 0, layer)
    this.map.set(layer.id, layer)
  }

  /**
   *
   * @param index 0 -> len-1
   */
  findLayer(index: number): Layer | null
  findLayer(id: string): Layer | null
  findLayer(condition: number | string): Layer | null {
    if (typeof condition === 'string')
      return this.map.get(condition) ?? null
    if (typeof condition === 'number') {
      if (condition < 0 || condition >= this.layers.length)
        throw new Error('index out of range')
      return this.layers[condition]
    }
    return null
  }

  removeLayer(index: number): void
  removeLayer(id: string): void
  removeLayer(condition: number | string): void {
    let node: Layer | null = null
    if (typeof condition === 'string')
      node = this.findLayer(condition)
    else if (typeof condition === 'number')
      node = this.findLayer(condition)
    if (node) {
      const index = this.layers.findIndex(v => v.id === node!.id)
      this.layers.splice(index, 1)
      this.map.delete(node.id)
    }
  }

  createLayer(title: string, config?: { show: boolean }): Layer {
    const { show = true } = config || {}
    return {
      id: nanoid(),
      title,
      show,
    }
  }

  getSize() {
    return this.layers.length
  }

  clear() {
    this.layers.length = 0
    this.map.clear()
  }

  initMap() {
    this.map.clear()
    this.layers.forEach((layer) => {
      this.map.set(layer.id, layer)
    })
  }
}
