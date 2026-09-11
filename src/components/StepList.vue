<template>
  <ol class="steps" :class="{ plain: !ordered }">
    <li v-for="(it, i) in items" :key="i">
      <span class="step-no" :class="{ cjk: /[一-龥]/.test(label(it, i)) }">{{ label(it, i) }}</span>
      <div class="step-body">
        <b v-if="it.title" class="step-title">{{ it.title }}</b>
        <div v-if="text(it)" class="small" :class="{ 'mt-4': it.title }">{{ text(it) }}</div>
        <div v-if="it.tags?.length" class="row wrap">
          <span v-for="tg in it.tags" :key="tg" class="pill hot">{{ tg }}</span>
        </div>
        <div v-if="it.rewards?.length" class="row wrap">
          <span v-for="r in it.rewards" :key="r" class="pill warm">🎁 {{ r }}</span>
        </div>
        <div v-if="it.note" class="small muted mt-4">* {{ it.note }}</div>
        <PostCopyBtn v-if="it.tags?.length || it.post" :ip="ip" :tags="it.tags || []" :post="it.post" :min-chars="it.minChars" />
      </div>
    </li>
  </ol>
</template>

<script setup>
// 展台活动 / 任务里的分步列表：items 每项可以是字符串，或 { no?, title?, desc?, tags?, post?, minChars?, rewards?, note? }
// no 为官方原文里的序号（Step1 / 01 / 任务 1 …），没有则按顺序编号；ordered=false 时用「•」表示无序
// 带话题的步骤在最底部出现「复制发帖文案」按钮
import PostCopyBtn from './PostCopyBtn.vue'

const props = defineProps({ items: { type: Array, default: () => [] }, ordered: { type: Boolean, default: true }, ip: String })
const text = (it) => (typeof it === 'string' ? it : it.desc)
const label = (it, i) => (typeof it === 'object' && it.no) || (props.ordered ? String(i + 1) : '•')
</script>
