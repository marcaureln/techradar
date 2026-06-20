<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string; color?: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedIndex = computed(() =>
  props.options.findIndex((o) => o.value === props.modelValue),
)
</script>

<template>
  <div class="relative flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
    <motion.div
      v-if="selectedIndex >= 0"
      class="absolute top-1 bottom-1 rounded-md bg-white shadow-sm"
      :style="{ width: `calc((100% - 8px) / ${options.length})`, left: `calc(4px + ${selectedIndex} * (100% - 8px) / ${options.length})` }"
      :animate="{ left: `calc(4px + ${selectedIndex} * (100% - 8px) / ${options.length})` }"
      :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    />
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="relative z-10 flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium transition-colors"
      :class="modelValue === option.value ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'"
      :style="modelValue === option.value && option.color ? { color: option.color } : {}"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>