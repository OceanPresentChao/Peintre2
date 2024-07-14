import { onBeforeUnmount, ref, type Ref } from 'vue'
import type { ElementRect, Position } from '@/types'

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

export function useSpacePress(): Ref<boolean> {
  const isSpacePress = ref(false)
  const onKeydown = (e: KeyboardEvent) => {
    if (e.code === 'Space')
      isSpacePress.value = true
  }
  const onKeyup = (e: KeyboardEvent) => {
    if (e.code === 'Space')
      isSpacePress.value = false
  }
  if (window) {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('keyup', onKeyup)
  }
  onBeforeUnmount(() => {
    if (window) {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('keyup', onKeyup)
    }
  })
  return isSpacePress
}

export function useThrottleFn<T extends (...args: any[]) => any>(fn: T, wait: number): T {
  let timer: number | null = null
  return function (...args: any[]) {
    if (timer)
      return
    timer = window.setTimeout(() => {
      timer = null
    }, wait)
    fn(...args)
  } as T
}

export function useMouse(): Ref<{ x: number; y: number }> {
  const client = ref({ x: 0, y: 0 })
  const onMouseMove = (e: MouseEvent) => {
    client.value.x = e.clientX
    client.value.y = e.clientY
  }
  if (window)
    window.addEventListener('mousemove', onMouseMove)

  onBeforeUnmount(() => {
    if (window)
      window.removeEventListener('mousemove', onMouseMove)
  })
  return client
}

export function pointDistance(a: Position, b: Position) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function pointToLineDist(p: Position, line: { start: Position; end: Position }) {
  const ab: Position = {
    x: line.end.x - line.start.x,
    y: line.end.y - line.start.y,
  }
  const ap: Position = {
    x: p.x - line.start.x,
    y: p.y - line.start.y,
  }
  const sin = (ab.x * ap.y - ab.y * ap.x) / ((pointDistance(line.start, line.end) * pointDistance(line.start, p)))
  return Math.abs(sin * pointDistance(line.start, p))
}

export function movePoint(offset: { x: number;y: number }, point: Position) {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y,
  }
}

export function isInsideRect(position: Position, rect: ElementRect) {
  return position.x >= rect.left && position.x <= rect.right && position.y >= rect.top && position.y <= rect.bottom
}
