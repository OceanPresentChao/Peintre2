<script setup lang="ts">
import draggable from 'vuedraggable'
import { Icon } from '@iconify/vue'
import { computed, ref, unref, watch } from 'vue'
import { ContextStyle, DrawType, Layer } from '@/types'

interface IToolBarProps {
  setting: ContextStyle
  layers: Layer[]
  curLayer: Layer
  toolType: DrawType
  stateLength: number
  curStateIndex: number
  minLineWidth: number
  maxLineWidth: number
  mode: 'side' | 'float'
  width?: number
  height?: number
}

interface ToolConfig {
  name: string
  icon: string
  title: string
}

const props = defineProps<IToolBarProps>()
const emits = defineEmits(['addLayer', 'setLayer', 'dragLayer', 'setTool', 'redo', 'undo', 'setStyle', 'save', 'removeLayer'])
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
  <div :style="{ 
    position: mode === 'float' ? 'absolute' : 'unset',
    display:'flex',
    maxWidth: width,
    maxHeight: height
    }"
  >
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
      <div>
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
        <input
          v-model="toolSetting.lineWidth" type="range" name="lineWidth"
          :title="String(toolSetting.lineWidth)"
          :step="1"
          :min="minLineWidth"
          :max="maxLineWidth"
          style="width: 5rem"
        >
      </div>
      <div style="display: flex;column-gap: 1rem;margin:5px 0;">
        <button 
        title="add layer" @click="$emit('addLayer')"
        class="btn-tool small-btn"
        >
          <Icon icon="material-symbols:add-card-outline" />
        </button>
        <button 
        title="remove layer" @click="$emit('removeLayer', curLayer.id)"
        class="btn-tool small-btn"
        >
          <Icon icon="material-symbols:credit-card-off-outline" />
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
              style="cursor: pointer;"
              :class="{ activeLayer: curLayer.id === element.id }"
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
  background-color: #fef3c7; /* bg-amber-100 */
}

.activeTool.pencil {
  color: #ef4444; /* text-red */
}

.activeTool.eraser {
  color: #3b82f6; /* text-blue */
}

.activeTool.line {
  color: #10b981; /* text-green */
}

.activeTool.rect {
  color: #facc15; /* text-yellow */
}

.activeTool.ellipse {
  color: #a855f7; /* text-purple */
}

.activeTool.select {
  color: #f97316; /* text-orange */
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
  padding: 0;
  margin: 0;
}

.btn-tool {
  border-radius: 5px;
  border-width: 2px;
  font-size: 1.25rem; 
  cursor: pointer;
  text-align: center;
  width: 2rem;
  height: 2rem;
}

.btn-tool:disabled {
  background-color: #d1d5db; 
  color: #6b7280;
  cursor: not-allowed;
}

.small-btn {
  font-size: 1rem; 
  width: 1.5rem;
  height: 1.5rem;
}

.tool-container {
  display: flex;
  align-items: center;
  padding-left: 0.25rem;   /* px-1 */
  padding-right: 0.25rem;  /* px-1 */
  padding-top: 0.75rem;    /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
  background-color: #f7fafc; /* bg-gray-100 */
  border-radius: 0.25rem;  /* border-rounded (assuming 4px for rounded) */
  box-shadow: 0 1px 2px 0 #0ea5e9; /* shadow-sky shadow-sm (customized for shadow color and small shadow) */
  column-gap: 0.3rem;
  row-gap: 0.3rem;
}

.tool-box {
  background-color: #10b981; /* bg-green */
  padding: 0.25rem;         /* p-1 */
  cursor: pointer;          /* cursor-pointer */
  border-radius: 50%;       /* border-radius: 50% */
  width: min-content;       /* width: min-content */
  height: min-content;      /* height: min-content */
}

.layer-item {
  outline: none;            /* outline-none */
  border: none;             /* border-none */
  padding-top: 0.25rem;     /* py-1 */
  padding-bottom: 0.25rem;  /* py-1 */
  background-color: transparent; /* bg-transparent */
  text-align: center;       /* text-center */
  width: 5rem;              /* w-20 (assuming 20 * 0.25rem for w-20) */
  font-size: large;         /* font-size:large */
  cursor: pointer;
}

</style>
