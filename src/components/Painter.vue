<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { PainterBoard } from '@/core/PainterBoard'
import { defaultStyle } from '@/core/common'
import { PencilElement } from '@/core/elements/PencilElement'
import { EraserElement } from '@/core/elements/EraserElement'
import type { ContextStyle, DrawElement, DrawType } from '@/types'
import { useSpacepress } from '@/core/tool'
import { EllipseElement } from '@/core/elements/EllipseElement'
import { LineElement } from '@/core/elements/LineElement'
import { RectElement } from '@/core/elements/RectElement'
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
  isMouseDown.value = true
  const { clientX, clientY } = ev
  if (painterBoard.value) {
    if (!isSpacePress.value) {
      let el: DrawElement
      switch (painterBoard.value.toolType) {
        case 'line':{
          el = new LineElement(painterBoard.value.currentLayer.id, cloneDeep(painterBoard.value.style))
          break
        }
        case 'rect':{
          el = new RectElement(painterBoard.value.currentLayer.id, cloneDeep(painterBoard.value.style))
          break
        }
        case 'ellipse':{
          el = new EllipseElement(painterBoard.value.currentLayer.id, cloneDeep(painterBoard.value.style))
          break
        }
        case 'text':
        case 'image':
        case 'pencil':{
          el = new PencilElement(painterBoard.value.currentLayer.id, cloneDeep(painterBoard.value.style))
          break
        }
        case 'eraser':{
          el = new EraserElement(painterBoard.value.currentLayer.id, cloneDeep(painterBoard.value.style))
          break
        }
      }
      painterBoard.value.currentElement = el
      painterBoard.value.addElement(el)
      switch (painterBoard.value.toolType) {
        case 'line':
        case 'rect':
        case 'text':
        case 'image':
        case 'ellipse':{
          painterBoard.value.setStartPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
          break
        }
        case 'pencil':
        case 'eraser':{
          painterBoard.value.addPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
          break
        }
      }
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
          switch (painterBoard.value.toolType) {
            case 'line':
            case 'rect':
            case 'text':
            case 'image':
            case 'ellipse':{
              painterBoard.value.setEndPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
              break
            }
            case 'pencil':
            case 'eraser':{
              painterBoard.value.addPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
              break
            }
          }
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
        switch (painterBoard.value.toolType) {
          case 'line':
          case 'rect':
          case 'text':
          case 'image':
          case 'ellipse':{
            painterBoard.value.setEndPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
            break
          }
          case 'pencil':
          case 'eraser':{
            painterBoard.value.addPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
            break
          }
        }
        painterBoard.value.render()
        painterBoard.value.currentElement = null
        painterBoard.value.saveSnapshot()
      }
    }
    painterBoard.value.mouseRecord.lastEnd = { x: clientX, y: clientY }
  }
}

function handleSetTool(tool: DrawType) {
  if (painterBoard.value)
    painterBoard.value.setToolType(tool)
}

function handleSetLayer(id: string) {
  painterBoard.value?.setCurrentLayer(id)
}

function handleAddLayer() {
  painterBoard.value?.addLayer()
}

function handleDragLayer() {
  if (painterBoard.value)
    painterBoard.value.render()
}
</script>

<template>
  <div>
    <p>
      isSpacePress:{{ isSpacePress }}
    </p>
    <p>
      layers:{{ painterBoard?.layerManager.layers }}
    </p>
    <p>
      tool:{{ painterBoard?.toolType }}
    </p>
    <div flex>
      <ToolBar
        v-if="painterBoard"
        v-model:setting="painterSetting"
        v-model:layers="painterBoard!.layerManager.layers"
        :cur-layer="painterBoard!.currentLayer"
        :tool-type="painterBoard!.toolType"
        @add-layer="handleAddLayer"
        @set-layer="handleSetLayer"
        @drag-layer="handleDragLayer"
        @set-tool="handleSetTool"
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
