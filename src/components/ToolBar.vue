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
  mode?: 'side' | 'float'
}

interface ToolConfig {
  name: string
  icon: string
  title: string
}

const props = withDefaults(defineProps<ToolBarProps>(), {
  mode: 'side',
})
const emits = defineEmits(['addLayer', 'setLayer', 'dragLayer', 'setTool', 'redo', 'undo', 'setStyle', 'save'])
const toolSetting = computed(() => unref(props.setting))
const isElapsed = ref(true)

const tools: ToolConfig[] = [{
  name: 'pencil',
  title: 'pencil',
  icon: 'mdi:lead-pencil',
}, {
  name: 'eraser',
  title: 'eraser',
  icon: 'mdi:eraser',
}, {
  name: 'line',
  title: 'line',
  icon: 'game-icons:straight-pipe',
}, {
  name: 'rect',
  title: 'rectangle',
  icon: 'material-symbols:rectangle-outline',
}, {
  name: 'ellipse',
  title: 'ellipse',
  icon: 'mdi:ellipse-outline',
}]

watch(toolSetting, (nv) => {
  emits('setStyle', nv)
}, { deep: true })
</script>

<template>
  <div :style="{ position: mode === 'float' ? 'absolute' : 'unset' }" flex>
    <div
      v-if="mode === 'float'"
      class="tool-box"
    >
      <Icon v-show="isElapsed" icon="mdi:toolbox" width="2rem" @click="isElapsed = false" />
      <Icon v-show="!isElapsed" icon="mdi:menu-close" width="2rem" @click="isElapsed = true" />
    </div>
    <div
      v-show="mode === 'float' ? !isElapsed : true"
      class="tool-container"
      :style="{ flexDirection: mode === 'float' ? 'unset' : 'column' }"
    >
      <div v-for="tool in tools" :key="tool.name">
        <button
          class="btn-tool"
          :class="[{ activeTool: toolType === tool.name }, tool.name]"
          :title="tool.title"
          @click="$emit('setTool', tool.name)"
        >
          <Icon :icon="tool.icon" />
        </button>
      </div>
      <div>
        <button
          :disabled="stateLength === 0 || curStateIndex >= stateLength - 1"
          class="btn-tool"
          title="redo"
          @click="$emit('redo')"
        >
          <Icon icon="akar-icons:arrow-back-thick" flip="horizontal" />
        </button>
      </div>
      <div>
        <button
          :disabled="stateLength === 0 || curStateIndex <= 0"
          class="btn-tool"
          title="undo"
          @click="$emit('undo')"
        >
          <Icon icon="akar-icons:arrow-back-thick" />
        </button>
      </div>
      <div>
        <button
          class="btn-tool select"
          :class="{ activeTool: toolType === 'select' }"
          title="select"
          @click="$emit('setTool', 'select')"
        >
          <Icon icon="carbon:select-window" />
        </button>
      </div>
      <div>
        <button
          class="btn-tool"
          title="save"
          @click="$emit('save')"
        >
          <Icon icon="material-symbols:save" />
        </button>
      </div>
      <div my-1.5>
        <div :style="{ color: toolSetting.strokeStyle }">
          <label for="stroke" m-2><Icon icon="material-symbols:border-color-rounded" inline /></label>
          <input id="stroke" v-model="toolSetting.strokeStyle" type="color" title="stroke color" w-8>
        </div>
        <div :style="{ color: toolSetting.fillStyle }">
          <label for="fill" m-2><Icon icon="ic:round-format-color-fill" inline /></label>
          <input id="fill" v-model="toolSetting.fillStyle" type="color" title="fill color" w-8>
        </div>
      </div>
      <div>
        <label><Icon icon="carbon:draw" inline for="lineWidth" /></label>
        <input v-model="toolSetting.lineWidth" type="range" name="lineWidth" w-20 :title="String(toolSetting.lineWidth)">
      </div>
      <div>
        <button text-lg title="add layer" @click="$emit('addLayer')">
          <Icon icon="material-symbols:add-card-outline" />
        </button>
      </div>
      <div class="layerList" overflow-y-auto max-h-26>
        <draggable
          :list="layers" item-key="id" :component-data="{ tag: 'div', name: 'flip-list', type: 'transition' }"
          ghost-class="ghost"
          @change="$emit('dragLayer')"
        >
          <template #item="{ element }">
            <div
              :class="{ activeLayer: curLayer.id === element.id }"
              my-1 py-1 border-rounded
              @click="$emit('setLayer', element.id)"
            >
              <input
                v-model="element.title"
                class="layer-item"
                type="text"
              >
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activeLayer {
  @apply bg-amber-100;
}

.activeTool.pencil {
  @apply text-red;
}

.activeTool.eraser {
  @apply text-blue;
}
.activeTool.line {
  @apply text-green;
}
.activeTool.rect {
  @apply text-yellow;
}
.activeTool.ellipse {
  @apply text-purple;
}

.activeTool.select {
  @apply text-orange;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.flip-list-move {
  transition: transform 0.5s;
}

button {
  border-color: currentColor;
}

.btn-tool {
  @apply border-rounded border-2 px-2 text-xl cursor-pointer my-0.3;
}

.btn-tool:disabled {
  @apply bg-gray-300 text-gray-500 cursor-not-allowed;
}

.icon-tool {
  @apply text-2xl;
}

.tool-container {
  @apply flex px-1 py-3 bg-gray-100 border-rounded shadow-sky shadow-sm;
}

.tool-box {
  @apply bg-green p-1 cursor-pointer;
  border-radius: 50%;
  width: min-content;
  height: min-content;
}

.layer-item {
  @apply outline-none border-none py-1 bg-transparent text-center w-20;
  font-size:large;
}
</style>
