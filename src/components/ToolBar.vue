<script setup lang="ts">
import draggable from 'vuedraggable'

import type { ContextStyle, DrawType, Layer } from '@/types'

interface ToolBarProps {
  setting: ContextStyle
  layers: Layer[]
  curLayer: Layer
  toolType: DrawType
  stateLength: number
  curStateIndex: number
}

const props = defineProps<ToolBarProps>()
const emits = defineEmits(['addLayer', 'setLayer', 'dragLayer', 'setTool', 'redo', 'undo', 'setStyle', 'save'])
const toolSetting = computed(() => unref(props.setting))

watch(toolSetting, (nv) => {
  emits('setStyle', nv)
}, { deep: true })
</script>

<template>
  <div>
    <div flex flex-col>
      <div>
        <button @click="$emit('setTool', 'pencil')">
          Pencil
        </button>
      </div>
      <div>
        <button @click="$emit('setTool', 'eraser')">
          Eraser
        </button>
      </div>
      <div>
        <button @click="$emit('setTool', 'line')">
          Line
        </button>
      </div>
      <div>
        <button @click="$emit('setTool', 'rect')">
          Rectangle
        </button>
      </div>
      <div>
        <button @click="$emit('setTool', 'ellipse')">
          Ellipse
        </button>
      </div>
      <div>
        <button :disabled="stateLength === 0 || curStateIndex >= stateLength - 1" @click="$emit('redo')">
          redo
        </button>
      </div>
      <div>
        <button :disabled="stateLength === 0 || curStateIndex <= 0" @click="$emit('undo')">
          undo
        </button>
      </div>
      <div>
        <button @click="$emit('save')">
          save
        </button>
      </div>
      <div>
        <button @click="$emit('setTool', 'select')">
          select
        </button>
      </div>
      <div>
        <label>Stroke Color:</label>
        <input v-model="toolSetting.strokeStyle" type="color">
        <label>Fill Color:</label>
        <input v-model="toolSetting.fillStyle" type="color">
      </div>
      <div>
        <label>Line Width:</label>
        <input v-model="toolSetting.lineWidth" type="range">
      </div>
      <div>
        <button text-lg @click="$emit('addLayer')">
          add Layer
        </button>
      </div>
      <div>
        <draggable
          :list="layers"
          item-key="id"
          :component-data="{ tag: 'div', name: 'flip-list', type: 'transition' }"
          ghost-class="ghost"
          @change="$emit('dragLayer')"
        >
          <template #item="{ element }">
            <div
              :class="{ active: curLayer.id === element.id }"
              @click="$emit('setLayer', element.id)"
            >
              <p>
                {{ element }}
              </p>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active {
  background-color: #d41414;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.flip-list-move {
  transition: transform 0.5s;
}
</style>
