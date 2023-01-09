<script setup lang="ts">
import { useMouse } from '@/core/tool'
const client = useMouse()
</script>

<template>
  <div text-center>
    <p text-2xl>
      Peintre
    </p>
    <p text-xl>
      Current Mouse x:{{ client.x }} y: {{ client.y }}
    </p>
    <div flex items-center justify-center>
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
