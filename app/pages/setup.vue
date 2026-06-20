<script setup lang="ts">
definePageMeta({
  layout: 'setup',
})

const store = useSetupStore()
</script>

<template>
  <SetupStepCompanyName v-if="store.step === 0" />
  <SetupStepReady v-else-if="store.step === 1" />
</template>