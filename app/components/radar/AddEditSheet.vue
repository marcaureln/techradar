<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { createBlipSchema, updateBlipSchema } from '#shared/validations/blip'
import { QUADRANT_LABELS, RING_LABELS, QUADRANT_COLORS } from '#shared/lib/radar/constants'
import type { BlipWithHistory, Quadrant, Ring } from '#shared/types'

const props = defineProps<{
  blip?: BlipWithHistory | null
}>()

const emit = defineEmits<{
  close: []
}>()

const isEdit = computed(() => !!props.blip)

const schema = computed(() =>
  isEdit.value ? toTypedSchema(updateBlipSchema) : toTypedSchema(createBlipSchema),
)

const { handleSubmit, values, setFieldValue, errors, meta } = useForm({
  validationSchema: schema.value,
  validateOnMount: false,
  initialValues: props.blip
    ? {
        name: props.blip.name,
        quadrant: props.blip.quadrant,
        ring: props.blip.ring,
        description: props.blip.description,
      }
    : {
        name: '',
        quadrant: 'techniques',
        ring: 'trial',
        description: '',
      },
})

const createBlip = useCreateBlip()
const updateBlip = useUpdateBlip()

const loading = ref(false)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    if (isEdit.value && props.blip) {
      await updateBlip.mutateAsync({ id: props.blip.id, ...values })
    } else {
      await createBlip.mutateAsync(values as any)
    }
    emit('close')
  } finally {
    loading.value = false
  }
})

const quadrantOptions = (Object.keys(QUADRANT_LABELS) as Quadrant[]).map((q) => ({
  value: q,
  label: QUADRANT_LABELS[q],
  color: QUADRANT_COLORS[q],
}))

const ringOptions = (Object.keys(RING_LABELS) as Ring[]).map((r) => ({
  value: r,
  label: RING_LABELS[r],
}))
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
      <h2 class="text-lg font-medium text-zinc-900">
        {{ isEdit ? 'Edit blip' : 'Add blip' }}
      </h2>
      <button
        class="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        @click="emit('close')"
      >
        <Icon name="ph:x" class="h-5 w-5" />
      </button>
    </div>

    <form class="flex-1 space-y-4 overflow-y-auto p-6" @submit="onSubmit">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">Name</label>
        <input
          :value="values.name"
          class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          placeholder="Technology name"
          @input="setFieldValue('name', ($event.target as HTMLInputElement).value)"
        />
        <p v-if="meta.dirty && errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">Quadrant</label>
        <RadarSegmentedControl
          :model-value="values.quadrant ?? 'techniques'"
          :options="quadrantOptions"
          @update:model-value="setFieldValue('quadrant', $event)"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">Ring</label>
        <RadarSegmentedControl
          :model-value="values.ring ?? 'trial'"
          :options="ringOptions"
          @update:model-value="setFieldValue('ring', $event)"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">
          Description <span class="text-zinc-400">(optional)</span>
        </label>
        <textarea
          :value="values.description"
          class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          style="field-sizing: content"
          rows="3"
          placeholder="What is this technology and why is it on the radar?"
          @input="setFieldValue('description', ($event.target as HTMLTextAreaElement).value)"
        />
        <p v-if="meta.dirty && errors.description" class="mt-1 text-xs text-red-500">{{ errors.description }}</p>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          :disabled="loading || !values.name?.trim()"
          class="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {{ loading ? 'Saving...' : (isEdit ? 'Update blip' : 'Add blip') }}
        </button>
      </div>
    </form>
  </div>
</template>