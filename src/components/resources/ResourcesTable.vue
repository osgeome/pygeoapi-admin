<template>
  <v-card>
    <v-table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Title</th>
          <th>Provider</th>
          <th>Languages</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="resource in resources" :key="resource.id">
          <td>{{ resource.name }}</td>
          <td>{{ resource.type }}</td>
          <td>{{ resource.title }}</td>
          <td>{{ resource.provider }}</td>
          <td>{{ resource.languages?.join(', ') || 'en' }}</td>
          <td>
            <div class="tw-flex tw-gap-2">
              <v-btn
                icon
                variant="text"
                size="small"
                @click="$emit('edit', resource)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="error"
                @click="$emit('delete', resource)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup lang="ts">
import type { ResourceType, BaseResource } from '@/types/resource'

interface ResourceTableItem extends BaseResource {
  id: string
  name: string
}

defineProps<{
  resources: ResourceTableItem[]
}>()

defineEmits<{
  (e: 'edit', resource: ResourceTableItem): void
  (e: 'delete', resource: ResourceTableItem): void
}>()
</script>

<style scoped>
.resource-table {
  width: 100%;
}
</style>
