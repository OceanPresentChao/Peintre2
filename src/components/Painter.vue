<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { onMounted, ref, watch } from 'vue'
import { PainterBoard } from '@/core/PainterBoard'
import ToolBar from '@/components/ToolBar.vue'
import { PencilElement } from '@/core/elements/PencilElement'
import { EraserElement } from '@/core/elements/EraserElement'
import type { ContextStyle, DrawElement, DrawType } from '@/types'
import { useSpacePress, useThrottleFn } from '@/core/tool'
import { EllipseElement } from '@/core/elements/EllipseElement'
import { LineElement } from '@/core/elements/LineElement'
import { RectElement } from '@/core/elements/RectElement'

interface IPainterProps {
  width?: number
  height?: number
  maxLineWidth?: number
  minLineWidth?: number
  mode?: 'side' | 'float'
}


const props = withDefaults(defineProps<IPainterProps>(), {
  width: 800,
  height: 600,
  maxLineWidth: 100,
  minLineWidth: 1,
  mode: 'side',
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const painterBoard = ref<PainterBoard | null>(null)
const isSpacePress = useSpacePress()
const isMouseDown = ref(false)

watch(isSpacePress, (nv) => {
  if (painterBoard.value) {
    if (nv)
      painterBoard.value.cursor.set('grab')
    else
      painterBoard.value.cursor.set('auto')
  }
})

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
      let el: DrawElement | null = null
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
        case 'select':{
          break
        }
      }
      if (el) {
        painterBoard.value.currentElement = el
        painterBoard.value.addElement(el)
      }

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
        case 'select':{
          painterBoard.value.select.clickElement(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
          break
        }
      }
      painterBoard.value.render()
    }
    else {
      painterBoard.value.cursor.set('grabbing')
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
        switch (painterBoard.value.toolType) {
          case 'line':
          case 'rect':
          case 'text':
          case 'image':
          case 'ellipse':{
            if (el)
              painterBoard.value.setEndPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
            break
          }
          case 'pencil':
          case 'eraser':{
            if (el)
              painterBoard.value.addPosition(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
            break
          }
          case 'select':{
            const selectEl = painterBoard.value.select.getSelectedElement()
            const offsetX = clientX - painterBoard.value.mouseRecord.lastMove.x
            const offsetY = clientY - painterBoard.value.mouseRecord.lastMove.y
            if (selectEl) {
              switch (painterBoard.value.select.transformType) {
                case 'null':{
                  break
                }
                case 'move':{
                  painterBoard.value.select.moveSelectedElement({ x: offsetX, y: offsetY })
                  break
                }
                case 'left-bottom':{
                  const scaleX = (selectEl.rect.width - offsetX) / selectEl.rect.width
                  const scaleY = (selectEl.rect.height + offsetY) / selectEl.rect.height
                  painterBoard.value.select.resizeSelectedElement(scaleX, scaleY)
                  break
                }
                case 'right-bottom':{
                  const scaleX = (selectEl.rect.width + offsetX) / selectEl.rect.width
                  const scaleY = (selectEl.rect.height + offsetY) / selectEl.rect.height
                  painterBoard.value.select.resizeSelectedElement(scaleX, scaleY)
                  break
                }
                case 'left-top':{
                  const scaleX = (selectEl.rect.width - offsetX) / selectEl.rect.width
                  const scaleY = (selectEl.rect.height - offsetY) / selectEl.rect.height
                  painterBoard.value.select.resizeSelectedElement(scaleX, scaleY)
                  break
                }
                case 'right-top':{
                  const scaleX = (selectEl.rect.width + offsetX) / selectEl.rect.width
                  const scaleY = (selectEl.rect.height - offsetY) / selectEl.rect.height
                  painterBoard.value.select.resizeSelectedElement(scaleX, scaleY)
                  break
                }
              }
            }
            break
          }
        }
        painterBoard.value.render()
      }
    }
    else {
      switch (painterBoard.value.toolType) {
        case 'line':
        case 'rect':
        case 'ellipse':
        case 'text':
        case 'image':
        case 'pencil':
        case 'eraser':{
          break
        }
        case 'select':{
          painterBoard.value.select.hoverSelectElement(painterBoard.value.clientToCanvas({ x: clientX, y: clientY }))
          break
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
        // painterBoard.value.cache()
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
  if (painterBoard.value)
    painterBoard.value.setCurrentLayer(id)
}

function handleAddLayer() {
  if (painterBoard.value)
    painterBoard.value.addLayer()
}

function handleRemoveLayer(layerId: string) {
  if (painterBoard.value) {
    painterBoard.value.removeLayer(layerId)
    painterBoard.value.render()
  }
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

function handleSaveImage() {
  if (painterBoard.value) {
    const a = document.createElement('a')
    a.href = painterBoard.value.canvas.toDataURL()
    a.download = 'peintre.png'
    a.click()
  }
}
</script>

<template>
  <div>
    <div style="position:relative;display:flex;">
      <ToolBar
        v-if="painterBoard"
        style="flex: none;"
        :mode="mode"
        :width="props.width" 
        :height="props.height"
        :layers="painterBoard!.layerManager.layers"
        :setting="painterBoard!.style"
        :cur-layer="painterBoard!.currentLayer"
        :tool-type="painterBoard!.toolType"
        :state-length="painterBoard!.recordManager.snapStack. length"
        :cur-state-index="painterBoard!.recordManager.index"
        :max-line-width="maxLineWidth"
        :min-line-width="minLineWidth"
        @add-layer="handleAddLayer"
        @set-layer="handleSetLayer"
        @remove-layer="handleRemoveLayer"
        @drag-layer="handleDragLayer"
        @set-tool="handleSetTool"
        @set-style="handleSetStyle"
        @redo="handleRedo"
        @undo="handleUndo"
        @save="handleSaveImage"
      />
      <div style="flex: none;background-color:#eee;">
        <canvas
          ref="canvasRef"
          :width="props.width" :height="props.height"
          @mousedown="handleMousedown"
          @mousemove="handleMousemove"
          @mouseup="handleMouseup"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
