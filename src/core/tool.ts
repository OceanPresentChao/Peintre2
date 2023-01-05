import type { Ref } from 'vue'

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

export function useSpacepress(): Ref<boolean> {
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
