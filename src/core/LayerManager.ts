import { nanoid } from 'nanoid'
import type { Layer, LinkNode } from '@/types'
export class LayerManager {
  private head: LinkNode<Layer>
  private tail: LinkNode<Layer>
  private len: number
  private map: Map<string, LinkNode<Layer>>
  constructor() {
    // 守卫结点
    this.head = {
      el: { id: '1', title: '1', show: false },
      next: null,
      prev: null,
    }
    this.tail = this.head
    this.len = 0
    this.map = new Map()
  }

  // insert 1: a b c -> a 1 b c
  insertLayer(layer: Layer, index: number) {
    if (index < 0 || index > this.len)
      throw new Error('index out of range')
    if (index === this.len) {
      const node: LinkNode<Layer> = {
        el: layer,
        next: null,
        prev: this.tail,
      }
      this.tail.next = node
      this.tail = node
      this.map.set(layer.id, node)
    }
    else {
      const old = this._findNode(index)!
      const node: LinkNode<Layer> = {
        el: layer,
        next: old,
        prev: old.prev,
      }
      old.prev!.next = node
      old.prev = node
      this.map.set(layer.id, node)
    }
    this.len++
  }

  /**
   *
   * @param index 0 -> len-1
   */
  findLayer(index: number): Layer | null
  findLayer(id: string): Layer | null
  findLayer(condition: number | string): Layer | null {
    if (typeof condition === 'string')
      return this._findNode(condition)?.el ?? null
    if (typeof condition === 'number') {
      if (condition < 0 || condition >= this.len)
        throw new Error('index out of range')
      return this._findNode(condition)?.el ?? null
    }
    return null
  }

  /**
   *
   * @param index 0 -> len-1
   */
  private _findNode(index: number): LinkNode<Layer> | null
  private _findNode(id: string): LinkNode<Layer> | null
  private _findNode(condition: number | string): LinkNode<Layer> | null {
    if (typeof condition === 'string') {
      return this.map.get(condition)!
    }
    else if (typeof condition === 'number') {
      if (condition < 0 || condition >= this.len)
        throw new Error('index out of range')
      let p = this.head
      for (let i = -1; i < condition; i++) {
        p = p.next!
        if (p === null)
          return null
      }
      return p
    }
    return null
  }

  removeLayer(index: number): void
  removeLayer(id: string): void
  removeLayer(condition: number | string): void {
    let node: LinkNode<Layer> | null = null
    if (typeof condition === 'string')
      node = this._findNode(condition)
    else if (typeof condition === 'number')
      node = this._findNode(condition)
    if (node === null)
      return
    node.prev!.next = node.next
    node.next!.prev = node.prev
    this.map.delete(node.el.id)
  }

  createLayer(title: string, config?: { show: boolean }): Layer {
    const { show = true } = config || {}
    return {
      id: nanoid(),
      title,
      show,
    }
  }

  *iter(): Generator<Layer> {
    let p: any = this.head
    while (p.next !== null) {
      yield p.next.el
      p = p.next
    }
  }

  getLayerArray(): Layer[] {
    const arr: Layer[] = []
    for (const layer of this.iter())
      arr.push(layer)
    return arr
  }

  getSize() {
    return this.len
  }
}
