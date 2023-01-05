<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { PainterBoard } from '@/core/PainterBoard'
import { defaultStyle } from '@/core/common'
import { PencilElement } from '@/core/PencilElement'
import type { ContextStyle, DrawElement } from '@/types'
import { useSpacepress } from '@/core/tool'
interface IPainterProps {
  width: number
  height: number
}
const props = withDefaults(defineProps<IPainterProps>(), {
  width: 800,
  height: 600,
})

const painterSetting = ref<ContextStyle>(cloneDeep(defaultStyle))
const canvasRef = ref<HTMLCanvasElement | null>(null)
const painterBoard = ref<PainterBoard | null>(null)
const isSpacePress = useSpacepress()
const isMouseDown = ref(false)
const layers = computed(() => {
  return painterBoard.value?.layerManager.getLayerArray() || []
})

onMounted(() => {
  if (canvasRef.value) {
    painterBoard.value = new PainterBoard(canvasRef.value)
    watch(painterSetting, (nv) => {
      if (painterBoard.value)
        painterBoard.value.setStyle(nv)
    }, { immediate: true, deep: true })
  }
})

function setCurrentLayer(id: string) {
  painterBoard.value?.setCurrentLayer(id)
}

function addLayer() {
  painterBoard.value?.addLayer()
}

function handleMousedown(ev: MouseEvent) {
  ev.preventDefault()
  isMouseDown.value = true
  const { clientX, clientY } = ev
  if (painterBoard.value) {
    if (!isSpacePress.value) {
      let el: DrawElement
      switch (painterBoard.value.toolType) {
        case 'line':
        case 'rect':
        case 'circle':
        case 'text':
        case 'image':
        case 'pencil':{
          el = new PencilElement(painterBoard.value.currentLayer.id, cloneDeep(painterBoard.value.style))
        }
      }
      painterBoard.value.currentElement = el
      painterBoard.value.addElement(el)
      painterBoard.value.addPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
      painterBoard.value.render()
    }
    painterBoard.value.mouseRecord.lastStart = { x: clientX, y: clientY }
  }
}

function handleMousemove(ev: MouseEvent) {
  ev.preventDefault()
  const { clientX, clientY } = ev
  if (painterBoard.value) {
    if (isMouseDown.value) {
      if (isSpacePress.value) {
        // 拖拽画布
        painterBoard.value.dragCanvas({ x: clientX, y: clientY })
        painterBoard.value.render()
      }
      else {
        const el = painterBoard.value.currentElement
        if (el) {
          painterBoard.value.addPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
          painterBoard.value.render()
        }
      }
    }
    painterBoard.value.mouseRecord.lastMove = { x: clientX, y: clientY }
  }
}

function handleMouseup(ev: MouseEvent) {
  ev.preventDefault()
  isMouseDown.value = false
  const { clientX, clientY } = ev
  if (painterBoard.value) {
    if (isSpacePress.value) {
      // painterBoard.value.saveSnapshot()
    }
    else {
      const el = painterBoard.value.currentElement
      if (el) {
        el.addPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
        painterBoard.value.render()
        painterBoard.value.currentElement = null
        painterBoard.value.saveSnapshot()
      }
    }
    painterBoard.value.mouseRecord.lastEnd = { x: clientX, y: clientY }
  }
}
</script>

<template>
  <div>
    <p>
      isSpacePress:{{ isSpacePress }}
    </p>
    <div flex>
      <ToolBar
        v-model="painterSetting"
        :layers="layers"
        :cur-layer="painterBoard?.currentLayer"
        :tool-type="painterBoard?.toolType || 'pencil'"
        @add-layer="addLayer"
        @set-layer="setCurrentLayer"
      />
      <canvas
        ref="canvasRef" bg-blue
        :width="props.width" :height="props.height"
        @mousedown="handleMousedown"
        @mousemove="handleMousemove"
        @mouseup="handleMouseup"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
