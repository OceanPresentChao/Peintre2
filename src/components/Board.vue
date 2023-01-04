<script setup lang="ts">
import { PainterBoard } from '@/core/PainterBoard'
import {PencilElement} from '@/core/PencilElement'
import {DrawElement} from '@/types'
const canvasRef = ref<HTMLCanvasElement | null>(null)
const painterBoard = ref<PainterBoard | null>(null)

onMounted(() => {
  if (canvasRef.value)
    painterBoard.value = new PainterBoard(canvasRef.value)
})

function handleMousedown(ev: MouseEvent) {
  const { clientX, clientY } = ev
  if(painterBoard.value){
    const el:DrawElement
    switch(painterBoard.value.toolType){
      case 'line':
      case 'rect':
      case 'circle':
      case 'text':
      case 'image':
      case 'pencil':{
        el = new PencilElement()
      }
    }
    painterBoard.value.
  }
}
</script>

<template>
  <div>
    <canvas ref="canvasRef" @mousedown="handleMousedown" />
  </div>
</template>

<style scoped>

</style>
