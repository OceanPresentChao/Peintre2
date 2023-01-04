<script setup lang="ts">
interface IPainterProps {
  width: number
  height: number
}

const props = withDefaults(defineProps<IPainterProps>(), {
  width: 800,
  height: 600,
})
</script>

<template>
  <div>
    <ToolBar />
    <Board :height="props.height" :width="props.width" />
  </div>
</template>

<style scoped>

</style>
