<script setup lang="ts">
import { PainterBoard } from '@/core/PainterBoard'
import { PencilElement } from '@/core/PencilElement'
import type { DrawElement } from '@/types'
import { clientToCanvas } from '@/core/tool'
interface IBoardProps {
  width: number
  height: number
}
const props = defineProps<IBoardProps>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const painterBoard = ref<PainterBoard | null>(null)

onMounted(() => {
  if (canvasRef.value)
    painterBoard.value = new PainterBoard(canvasRef.value)
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
        el = new PencilElement(painterBoard.value.currentLayer)
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
    <canvas
      ref="canvasRef" bg-blue
      :width="props.width" :height="props.height"
      @mousedown="handleMousedown" @mousemove="handleMousemove" @mouseup="handleMouseup"
    />
  </div>
</template>

<style scoped>

</style>
