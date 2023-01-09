import { cloneDeep } from 'lodash'
import { nanoid } from 'nanoid'
import { deserializeElement, serializeElement } from './elements/tool'
import type { DrawElement, Layer, Snapshot } from '@/types'

export class RecordManager {
  snapStack: Snapshot[] = []
  index: number
  constructor() {
    this.index = -1
  }

  pushSnapshot(data: Snapshot) {
    this.snapStack.push(data)
    this.index++
  }

  backward() {
    if (this.index >= 0)
      this.index--
    if (this.index >= 0)
      return this.snapStack[this.index]
    else
      return null
  }

  forward() {
    if (this.index < this.snapStack.length)
      this.index++
    if (this.index < this.snapStack.length)
      return this.snapStack[this.index]
    else
      return null
  }

  getCurrentSnapshot() {
    if (this.index >= 0 && this.index < this.snapStack.length)
      return this.snapStack[this.index]
    else
      return null
  }

  createSnapshot(stack: Layer[], elements: Map<string, DrawElement[]>): Snapshot {
    return {
      id: nanoid(),
      stack,
      elements,
    }
  }

  serializeSnap(snap: Snapshot): string {
    const clone = cloneDeep(snap)
    const obj: Record<string, any> = {}
    obj.id = clone.id
    obj.stack = clone.stack
    // 序列化map需要将其转换成数组
    obj.elements = Array.from(clone.elements)
    obj.elements = obj.elements.map(([key, els]: [string, any[]]) => {
      return [key, els.map(el => serializeElement(el))]
    })
    return JSON.stringify(obj)
  }

  deserializeSnap(str: string): Snapshot {
    const obj = JSON.parse(str) as {
      id: string
      stack: Layer[]
      elements: [string, string[]][]
    }
    const snap: Record<string, any> = {}
    Object.assign(snap, obj)

    snap.elements = snap.elements.map(([key, els]: [string, string[]]) => {
      return [key, els.map(el => deserializeElement(el))]
    })
    const map = new Map<string, DrawElement[]>()
    snap.elements.forEach(([key, els]: [string, DrawElement[]]) => {
      map.set(key, els)
    })
    snap.elements = map

    return snap as Snapshot
  }
}
