<script setup lang="ts">
import { computed, ref } from 'vue';
import { motion } from 'motion-v';

const props = defineProps<{
  modelValue: string;
  options: { value: string; label: string; color?: string }[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === props.modelValue));

const buttons = ref<HTMLButtonElement[]>([]);

function move(delta: number) {
  const count = props.options.length;
  const from = selectedIndex.value < 0 ? 0 : selectedIndex.value;
  const next = (from + delta + count) % count;
  emit('update:modelValue', props.options[next]!.value);
  buttons.value[next]?.focus();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    move(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    move(-1);
  }
}
</script>

<template>
  <div
    role="radiogroup"
    class="relative flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1"
    @keydown="onKeydown"
  >
    <motion.div
      v-if="selectedIndex >= 0"
      class="absolute top-1 bottom-1 rounded-md bg-white shadow-sm"
      :style="{
        width: `calc((100% - 8px) / ${options.length})`,
        left: `calc(4px + ${selectedIndex} * (100% - 8px) / ${options.length})`,
      }"
      :animate="{ left: `calc(4px + ${selectedIndex} * (100% - 8px) / ${options.length})` }"
      :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    />
    <button
      v-for="(option, i) in options"
      :key="option.value"
      :ref="
        (el) => {
          if (el) buttons[i] = el as HTMLButtonElement;
        }
      "
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      :tabindex="modelValue === option.value || selectedIndex < 0 ? 0 : -1"
      class="relative z-10 flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
      :class="modelValue === option.value ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'"
      :style="modelValue === option.value && option.color ? { color: option.color } : {}"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
