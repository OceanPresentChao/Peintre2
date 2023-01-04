<script setup lang="ts">
import { PainterBoard } from '@/core/PainterBoard'
import { defaultStyle } from '@/core/common'
import { PencilElement } from '@/core/PencilElement'
import type { ContextStyle, DrawElement } from '@/types'
import { clientToCanvas, deepCopy } from '@/core/tool'

const props = withDefaults(defineProps<IPainterProps>(), {
  width: 800,
  height: 600,
})
const painterSetting = ref<ContextStyle>(deepCopy(defaultStyle))
interface IPainterProps {
  width: number
  height: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const painterBoard = ref<PainterBoard | null>(null)

onMounted(() => {
  if (canvasRef.value) {
    painterBoard.value = new PainterBoard(canvasRef.value)
    watch(painterSetting, (nv) => {
      if (painterBoard.value)
        painterBoard.value.setStyle(nv)
    }, { immediate: true, deep: true })
  }
})

function handleMousedown(ev: MouseEvent) {
  ev.preventDefault()
  const { clientX, clientY } = ev
  if (painterBoard.value) {
    let el: DrawElement
    switch (painterBoard.value.toolType) {
      case 'line':
      case 'rect':
      case 'circle':
      case 'text':
      case 'image':
      case 'pencil':{
        el = new PencilElement(painterBoard.value.currentLayer, deepCopy(painterBoard.value.style))
      }
    }
    const can = painterBoard.value.canvas
    el.addPosition(clientToCanvas(can, { x: clientX, y: clientY }))
    painterBoard.value.currentElement = el
    painterBoard.value.addElement(el)
    painterBoard.value.render()
  }
}

function handleMousemove(ev: MouseEvent) {
  ev.preventDefault()
  const { clientX, clientY } = ev
  if (painterBoard.value) {
    const el = painterBoard.value.currentElement
    if (el) {
      const can = painterBoard.value.canvas
      el.addPosition(clientToCanvas(can, { x: clientX, y: clientY }))
      painterBoard.value.render()
    }
  }
}

function handleMouseup(ev: MouseEvent) {
  ev.preventDefault()
  const { clientX, clientY } = ev
  if (painterBoard.value) {
    const el = painterBoard.value.currentElement
    if (el) {
      const can = painterBoard.value.canvas
      el.addPosition(clientToCanvas(can, { x: clientX, y: clientY }))
      painterBoard.value.render()
      painterBoard.value.currentElement = null
    }
  }
}
</script>

<template>
  <div>
    <div>
      <ToolBar v-model="painterSetting" />
      <canvas
        ref="canvasRef" bg-blue
        :width="props.width" :height="props.height"
        @mousedown="handleMousedown" @mousemove="handleMousemove" @mouseup="handleMouseup"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
