<script setup lang="ts">
const { x, y } = useMouse({ type: 'client' })
</script>

<template>
  <div text-center>
    <p text-2xl>
      Peintre
    </p>
    <p text-xl>
      Current Mouse x:{{ x }} y: {{ y }}
    </p>
    <slot />
  </div>
</template>

<style scoped>

</style>
