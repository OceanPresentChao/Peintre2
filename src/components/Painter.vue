<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { PainterBoard } from '@/core/PainterBoard'
import { PencilElement } from '@/core/elements/PencilElement'
import { EraserElement } from '@/core/elements/EraserElement'
import type { ContextStyle, DrawElement, DrawType } from '@/types'
import { useSpacePress, useThrottleFn } from '@/core/tool'
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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const painterBoard = ref<PainterBoard | null>(null)
const isSpacePress = useSpacePress()
const isMouseDown = ref(false)

onMounted(() => {
  if (canvasRef.value)
    painterBoard.value = new PainterBoard(canvasRef.value)
})

function onMousedown(ev: MouseEvent) {
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

      if (painterBoard.value.recordManager.index !== painterBoard.value.recordManager.snapStack.length - 1)
        painterBoard.value.recordManager.snapStack.splice(painterBoard.value.recordManager.index + 1)

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

function onMousemove(ev: MouseEvent) {
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

function onMouseup(ev: MouseEvent) {
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
        painterBoard.value.cache()
      }
    }
    painterBoard.value.mouseRecord.lastEnd = { x: clientX, y: clientY }
  }
}

const handleMousedown = onMousedown
const handleMousemove = useThrottleFn(onMousemove, 10)
const handleMouseup = onMouseup

function handleSetTool(tool: DrawType) {
  if (painterBoard.value)
    painterBoard.value.setToolType(tool)
}

function handleSetStyle(style: ContextStyle) {
  if (painterBoard.value)
    painterBoard.value.setStyle(style)
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

function handleRedo() {
  if (painterBoard.value) {
    painterBoard.value.redo()
    painterBoard.value.render()
  }
}

function handleUndo() {
  if (painterBoard.value) {
    painterBoard.value.undo()
    painterBoard.value.render()
  }
}
</script>

<template>
  <div>
    <p>
      isSpacePress:{{ isSpacePress }}
    </p>
    <p>
      tool:{{ painterBoard?.toolType }}
    </p>
    <p>
      record len:{{ painterBoard?.recordManager.snapStack.length }}
    </p>
    <p text-lg>
      state:
    </p>
    <div v-for="[id, els] in painterBoard?.state" :key="id">
      layer id:{{ id }}
      <p v-for="el in els" :key="el.id">
        {{ el.id }}
      </p>
    </div>
    <div h-10 />
    <p text-lg>
      layers:
    </p>
    <div v-for="l in painterBoard?.layerManager.layers" :key="l.id">
      layer id:{{ l.id }}
    </div>
    <p>
      index:{{ painterBoard?.recordManager.index }}
    </p>
    <div flex>
      <ToolBar
        v-if="painterBoard"
        :layers="painterBoard!.layerManager.layers"
        :setting="painterBoard!.style"
        :cur-layer="painterBoard!.currentLayer"
        :tool-type="painterBoard!.toolType"
        :state-length="painterBoard!.recordManager.snapStack. length"
        :cur-state-index="painterBoard!.recordManager.index"
        @add-layer="handleAddLayer"
        @set-layer="handleSetLayer"
        @drag-layer="handleDragLayer"
        @set-tool="handleSetTool"
        @set-style="handleSetStyle"
        @redo="handleRedo"
        @undo="handleUndo"
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
