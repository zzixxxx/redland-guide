<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['BoothsPage', 'ParadePage', 'StagePage']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <TabBar v-if="showTab" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()
const showTab = computed(() => route.name !== 'booth')
</script>
