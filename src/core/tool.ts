import type { Position } from '@/types'

export function clientToCanvas(canvas: HTMLCanvasElement, position: Position): Position {
  const { left, top } = canvas.getBoundingClientRect()
  return {
    x: position.x - left,
    y: position.y - top,
  }
}

export function deepCopy<T>(instance: T, map = new WeakMap<any, any>()): T {
  if (instance == null)
    return instance
  if (map.has(instance))
    return instance
  if (instance instanceof Date)
    return new Date(instance.getTime()) as any

  if (Array.isArray(instance)) {
    const cloneArr = [] as any[];
    (instance as any[]).forEach((value) => { cloneArr.push(value) })
    return cloneArr.map((value: any) => deepCopy<any>(value), map) as any
  }
  if (instance instanceof Object) {
    const copyInstance = {
      ...(instance as { [key: string]: any }
      ),
    } as { [key: string]: any }
    for (const attr in instance) {
      if (attr in instance)
        copyInstance[attr] = deepCopy(instance[attr as keyof typeof instance], map)
    }
    return copyInstance as T
  }
  return instance
}
