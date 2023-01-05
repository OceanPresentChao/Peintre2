<script setup lang="ts">
import type { ContextStyle, DrawType, Layer } from '@/types'
interface ToolBarProps {
  modelValue: ContextStyle
  layers: Layer[]
  curLayer: Layer | undefined
  toolType: DrawType
}
const props = defineProps<ToolBarProps>()
const emits = defineEmits(['update:value', 'addLayer', 'setLayer'])
const setting = ref<ContextStyle>(unref(props.modelValue))

watch(setting, (nv) => {
  emits('update:value', nv)
}, { deep: true })
</script>

<template>
  <div>
    <div flex flex-col>
      <div>1</div>
      <div>
        <label>Stroke Color:</label>
        <input v-model="setting.strokeStyle" type="color">
        <label>Fill Color:</label>
        <input v-model="setting.fillStyle" type="color">
      </div>
      <div>
        <label>Line Width:</label>
        <input v-model="setting.lineWidth" type="range">
      </div>
      <div>
        <button text-lg @click="$emit('addLayer')">
          add Layer
        </button>
      </div>
      <div>
        <p
          v-for="l in layers" :key="l.id"
          :class="{ active: curLayer?.id === l.id }"
          @click="$emit('setLayer', l.id)"
        >
          {{ l }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active {
  background-color: #d41414;
}
</style>
