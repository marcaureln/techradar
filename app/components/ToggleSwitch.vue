<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';

defineProps<{ disabled?: boolean }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <SwitchRoot
    v-model="model"
    :disabled="disabled"
    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-zinc-200"
  >
    <SwitchThumb
      class="pointer-events-none block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]"
    />
  </SwitchRoot>
</template>
