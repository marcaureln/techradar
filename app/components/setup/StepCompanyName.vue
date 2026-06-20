<script setup lang="ts">

const store = useSetupStore()
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-medium text-zinc-900">
        Set up your Tech Radar
      </h1>
      <p class="text-sm text-zinc-500">
        Name your radar to begin.
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">
          Company / Team name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="store.companyName"
          type="text"
          placeholder="Acme Corp"
          class="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-zinc-700">
          Logo <span class="text-zinc-400">(optional)</span>
        </label>
        <div
          class="flex h-24 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-zinc-200 transition-colors hover:border-zinc-300"
          :class="store.logoPreview ? 'border-solid p-2' : ''"
          @dragover.prevent
          @drop.prevent="(e: DragEvent) => {
            const file = e.dataTransfer?.files?.[0]
            if (file && file.type.startsWith('image/')) store.setLogo(file)
          }"
          @click="($refs.fileInput as HTMLInputElement)?.click()"
        >
          <img
            v-if="store.logoPreview"
            :src="store.logoPreview"
            alt="Logo preview"
            class="h-full max-h-20 w-auto rounded object-contain"
          />
          <span v-else class="text-sm text-zinc-400">
            Drop an image here or click to browse
          </span>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="(e: Event) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) store.setLogo(file)
            }"
          />
        </div>
        <button
          v-if="store.logoPreview"
          class="mt-1 text-xs text-zinc-400 hover:text-zinc-600"
          @click="store.setLogo(null)"
        >
          Remove logo
        </button>
      </div>

      <label class="flex cursor-pointer items-start gap-2.5 rounded-md border border-zinc-200 p-3 transition-colors hover:border-zinc-300">
        <input
          v-model="store.addSamples"
          type="checkbox"
          class="mt-0.5 h-4 w-4 accent-zinc-900"
        />
        <span class="text-sm">
          <span class="block font-medium text-zinc-800">Start with sample blips</span>
          <span class="block text-zinc-500">Pre-fill the radar with a dozen example technologies. Uncheck to start with a blank radar.</span>
        </span>
      </label>
    </div>

    <button
      :disabled="!store.companyName.trim()"
      class="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      @click="store.step++"
    >
      Continue
    </button>
  </div>
</template>