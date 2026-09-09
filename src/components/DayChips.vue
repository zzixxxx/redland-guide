<template>
  <div class="chips">
    <button
      v-for="d in days"
      :key="d.day"
      class="chip"
      :class="{ on: d.day === modelValue }"
      @click="$emit('update:modelValue', d.day)"
    >
      DAY{{ d.day }}
      <small>{{ d.short }} {{ d.week }}</small>
    </button>
  </div>
</template>

<script setup>
import { event } from '../data/rules.js'
defineProps({ modelValue: Number })
defineEmits(['update:modelValue'])
const days = event.days
</script>
