<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/vue-table'
import { QUADRANT_COLORS, QUADRANT_LABELS, RING_LABELS } from '#shared/lib/radar/constants'
import { isDue } from '#shared/lib/radar/review'
import type { BlipWithHistory } from '#shared/types'

const daysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const showArchived = ref(route.query.archived === 'true')

watch(showArchived, (v) => {
  const query = { ...route.query }
  if (v) query.archived = 'true'
  else delete query.archived
  router.replace({ query })
})

const { data: activeBlips, isPending: activePending } = useBlips(false)
const { data: archivedBlips, isPending: archivedPending } = useBlips(true)
const isPending = computed(() => (showArchived.value ? archivedPending.value : activePending.value))

const blips = computed(() => {
  if (showArchived.value) {
    return archivedBlips.value ?? []
  }
  return activeBlips.value ?? []
})

const markReviewed = useMarkReviewed()
const restoreBlip = useRestoreBlip()

const filterQuadrant = ref('')
const filterRing = ref('')
const filterStatus = ref('')

const filteredData = computed(() => {
  let result = blips.value

  if (filterQuadrant.value) {
    result = result.filter((b) => b.quadrant === filterQuadrant.value)
  }
  if (filterRing.value) {
    result = result.filter((b) => b.ring === filterRing.value)
  }
  if (filterStatus.value === 'overdue') {
    result = result.filter((b) => isDue(b))
  } else if (filterStatus.value === 'current') {
    result = result.filter((b) => !isDue(b))
  }

  return result
})

const sorting = ref([{ id: 'number', desc: false }])

const columns = [
  { accessorKey: 'number', header: '#', size: 50 },
  { accessorKey: 'name', header: 'Name', size: 200 },
  {
    accessorKey: 'quadrant',
    header: 'Quadrant',
    size: 150,
    cell: (info: any) => QUADRANT_LABELS[info.getValue() as keyof typeof QUADRANT_LABELS],
  },
  {
    accessorKey: 'ring',
    header: 'Ring',
    size: 100,
    cell: (info: any) => RING_LABELS[info.getValue() as keyof typeof RING_LABELS],
  },
  {
    accessorKey: 'lastEvaluatedAt',
    header: 'Last Evaluated',
    size: 130,
    cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
  },
  { accessorKey: 'daysSince', header: 'Days Since', size: 100, enableSorting: false },
  { accessorKey: 'status', header: 'Status', size: 120, enableSorting: false },
  { accessorKey: 'actions', header: '', size: 150, enableSorting: false },
]

const table = useVueTable({
  get data() { return filteredData.value },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  state: {
    get sorting() { return sorting.value },
  },
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-8">
    <div class="mb-6 flex items-end justify-between">
      <div>
        <h1 class="text-lg font-medium text-zinc-900">Review</h1>
        <p class="text-sm text-zinc-500">Re-evaluate each blip every 90 days. Mark it reviewed to reset the clock.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="!showArchived ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'"
          @click="showArchived = false"
        >
          Active
        </button>
        <button
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="showArchived ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'"
          @click="showArchived = true"
        >
          Archived
        </button>
      </div>
    </div>

    <div class="mb-4 flex gap-3">
      <select
        v-model="filterQuadrant"
        class="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none"
      >
        <option value="">All quadrants</option>
        <option v-for="(label, key) in QUADRANT_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <select
        v-model="filterRing"
        class="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none"
      >
        <option value="">All rings</option>
        <option v-for="(label, key) in RING_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <select
        v-model="filterStatus"
        class="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none"
      >
        <option value="">All statuses</option>
        <option value="overdue">Overdue</option>
        <option value="current">Current</option>
      </select>
    </div>

    <div class="overflow-x-auto rounded-lg border border-zinc-200">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50">
          <tr>
            <th
              v-for="header in table.getHeaderGroups()[0]?.headers"
              :key="header.id"
              class="border-b border-zinc-200 px-3 py-2 text-left text-xs font-medium text-zinc-500"
              :class="header.column.getCanSort() ? 'cursor-pointer select-none hover:text-zinc-700' : ''"
              @click="header.column.getCanSort() && header.column.toggleSorting()"
            >
              <span class="inline-flex items-center gap-1">
                {{ typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.id }}
                <Icon
                  v-if="header.column.getIsSorted()"
                  :name="header.column.getIsSorted() === 'desc' ? 'ph:arrow-down' : 'ph:arrow-up'"
                  class="h-3 w-3 text-zinc-400"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody v-if="isPending">
          <tr v-for="r in 6" :key="'sk-' + r" class="border-b border-zinc-100 last:border-0">
            <td v-for="c in 8" :key="c" class="px-3 py-3"><Skeleton class="h-4 w-full" /></td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.original.id"
            class="border-b border-zinc-100 last:border-0"
            :style="isDue(row.original) ? { borderLeftWidth: '2px', borderLeftColor: QUADRANT_COLORS[row.original.quadrant] as string } : {}"
          >
            <td class="px-3 py-2">
              <span class="font-medium text-zinc-900">{{ row.original.number }}</span>
            </td>
            <td class="px-3 py-2 font-medium text-zinc-900">{{ row.original.name }}</td>
            <td class="px-3 py-2">
              <span
                class="rounded px-1.5 py-0.5 text-xs font-medium"
                :style="{
                  backgroundColor: `${QUADRANT_COLORS[row.original.quadrant]}15`,
                  color: QUADRANT_COLORS[row.original.quadrant],
                }"
              >
                {{ QUADRANT_LABELS[row.original.quadrant as keyof typeof QUADRANT_LABELS] }}
              </span>
            </td>
            <td class="px-3 py-2 text-zinc-600">{{ RING_LABELS[row.original.ring as keyof typeof RING_LABELS] }}</td>
            <td class="px-3 py-2 text-zinc-500">{{ new Date(row.original.lastEvaluatedAt).toLocaleDateString() }}</td>
            <td class="px-3 py-2 text-zinc-500">{{ daysSince(row.original.lastEvaluatedAt) }}d</td>
            <td class="px-3 py-2">
              <span
                v-if="isDue(row.original)"
                class="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-600"
              >
                Overdue
              </span>
              <span v-else class="text-xs text-zinc-500">Current</span>
            </td>
            <td class="px-3 py-2">
              <div class="flex gap-2">
                <button
                  v-if="!showArchived"
                  class="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                  @click="markReviewed.mutate(row.original.id)"
                >
                  Mark reviewed
                </button>
                <button
                  v-if="showArchived"
                  class="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                  @click="restoreBlip.mutate(row.original.id)"
                >
                  Restore
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>