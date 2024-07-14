<script setup lang="ts">
import { useMouse } from '../../src/core/tool'
import Painter from '../../src/index'
import { ref } from 'vue'

const client = useMouse()
const mode = ref<'side' | 'float'>('side')
</script>

<template>
  <div text-center>
    <p text-2xl>
      Peintre2
    </p>
    <p text-xl>
      Current Mouse x:{{ client.x }} y: {{ client.y }}
    </p>
    <p text-xl>
      Current Mode:
      <select id="mode" v-model="mode" name="mode" p-1 text-lg>
        <option value="side">
          side
        </option>
        <option value="float">
          float
        </option>
      </select>
    </p>
    <div flex items-center justify-center>
      <Painter :mode="mode" :width="200" :height="100" />
    </div>
  </div>
</template>

<style scoped>

</style>
