<script setup lang="ts">
defineProps<{
  msg: string
}>()
const count = ref(0)
const { t, locale, availableLocales } = useI18n()

function increment() {
  count.value++
}

function decrease() {
  count.value--
}

function changeLocale() {
  const index = availableLocales.indexOf(locale.value)
  locale.value = availableLocales[(index + 1) % availableLocales.length]
}
</script>

<template>
  <div class="greetings">
    <h1 class="green">
      {{ msg }}
    </h1>
    <h3>
      You’ve successfully created a project with
      <a target="_blank" href="https://vitejs.dev/">Vite</a> +
      <a target="_blank" href="https://vuejs.org/">Vue 3</a>+
      <a target="_blank" href="https://vueuse.org/">VueUse</a>.
    </h3>
    <div>
      <div text-green-400>
        Count:{{ count }}
      </div>
      <div flex justify-evenly>
        <button @click="increment">
          add count
        </button>
        <button @click="decrease">
          decrease count
        </button>
      </div>
      <div>
        <button @click="changeLocale">
          Change Locale:
        </button>
        <span class="text-blue-400">
          {{ t("msg") }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
  color: rgb(30, 218, 30);
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

.greetings {
  text-align: center;
}
</style>
