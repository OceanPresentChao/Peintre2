<script setup lang="ts">
import type { ContextStyle } from '@/types'
interface ToolBarProps {
  modelValue: ContextStyle
}
const props = defineProps<ToolBarProps>()
const emits = defineEmits(['update:value'])
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
      <div>4</div>
    </div>
  </div>
</template>

<style scoped>

</style>
