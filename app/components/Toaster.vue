<script setup lang="ts">
const { toasts, dismiss } = useToast()

function runAction(id: number, action?: () => void) {
  action?.()
  dismiss(id)
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2">
      <TransitionGroup
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="translate-y-2 opacity-0"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900"
        >
          <span>{{ t.message }}</span>
          <button
            v-if="t.actionLabel"
            class="-my-1 rounded-md px-2 py-1.5 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50"
            @click="runAction(t.id, t.action)"
          >
            {{ t.actionLabel }}
          </button>
          <button
            class="-mr-1 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Dismiss"
            @click="dismiss(t.id)"
          >
            <Icon name="ph:x" class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
