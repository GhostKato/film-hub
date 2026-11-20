<template>
  <div v-if="selectedCount > 0" class="bulk-wrapper">
    <div class="bulk-top-bar">
      <button
        v-if="selectedCount >= 2"
        type="button"
        class="action-pill primary"
        :disabled="isSubmitting"
        @click="$emit('create-group')"
      >
        👥 {{ $t('chat.group_chats') }} ({{ selectedCount }})
      </button>

      <button
        v-if="allowBroadcast"
        type="button"
        class="action-pill"
        :class="{ active: isBroadcastOpen }"
        @click="isBroadcastOpen = !isBroadcastOpen"
      >
        📢 {{ $t('chat.group_send_btn') }} ({{ selectedCount }})
      </button>

      <button
        type="button"
        class="icon-pill"
        @click="$emit('toggle-all')"
        :title="isAllSelected ? $t('chat.unselect_all') : $t('chat.select_all')"
      >
        {{ isAllSelected ? '☑' : '☐' }}
      </button>

      <button
        type="button"
        class="icon-pill danger"
        @click="handleClear"
        :title="$t('chat.unselect_all')"
      >
        ✕
      </button>
    </div>

    <div v-if="allowBroadcast && isBroadcastOpen" class="broadcast-box">
      <div v-if="canSendSystem" class="broadcast-type-row">
        <button
          type="button"
          class="type-pill"
          :class="{ active: modeType === 'direct' }"
          @click="modeType = 'direct'"
        >
          💬 {{ $t('chat.broadcast_direct_type') }}
        </button>
        <button
          type="button"
          class="type-pill"
          :class="{ active: modeType === 'system' }"
          @click="modeType = 'system'"
        >
          🔔 {{ $t('chat.broadcast_system_type') }}
        </button>
      </div>

      <input
        v-if="modeType === 'system' && canSendSystem"
        v-model="title"
        type="text"
        class="glass-input"
        :placeholder="$t('chat.broadcast_title_placeholder')"
      />

      <textarea
        v-model="text"
        rows="2"
        class="glass-input"
        :placeholder="$t('chat.broadcast_text_placeholder')"
      ></textarea>

      <label v-if="modeType === 'system' && canSendSystem" class="checkbox-row">
        <input type="checkbox" v-model="isAnonymous" />
        <span>{{ $t('chat.send_anonymously') }}</span>
      </label>

      <button
        type="button"
        class="send-broadcast-btn"
        :disabled="!text.trim() || isSubmitting"
        @click="submit"
      >
        {{ $t('chat.send_to_selected', { count: selectedCount }) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  selectedCount: number
  isAllSelected: boolean
  allowBroadcast?: boolean
  canSendSystem?: boolean
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'create-group'): void
  (e: 'toggle-all'): void
  (e: 'clear'): void
  (
    e: 'send-broadcast',
    payload: { type: 'direct' | 'system'; title: string; text: string; isAnonymous: boolean },
  ): void
}>()

const isBroadcastOpen = ref(false)
const modeType = ref<'direct' | 'system'>('direct')
const title = ref('')
const text = ref('')
const isAnonymous = ref(true)

watch(
  () => props.selectedCount,
  (count) => {
    if (count === 0) {
      isBroadcastOpen.value = false
      title.value = ''
      text.value = ''
    }
  },
)

const handleClear = () => {
  isBroadcastOpen.value = false
  title.value = ''
  text.value = ''
  emit('clear')
}

const submit = () => {
  if (!text.value.trim()) return
  emit('send-broadcast', {
    type: modeType.value,
    title: title.value,
    text: text.value,
    isAnonymous: isAnonymous.value,
  })
}
</script>

<style scoped>
.bulk-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bulk-top-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-pill {
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-red-soft);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
}

.action-pill:hover,
.action-pill.active,
.action-pill.primary {
  background-color: var(--glass-red);
  border-color: var(--color-hover);
}

.icon-pill {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-white);
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-pill:hover {
  border-color: var(--color-hover);
  background-color: var(--glass-hover);
}

.icon-pill.danger:hover {
  background-color: var(--glass-red);
}

.broadcast-box {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 9px;
  border-radius: 10px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.broadcast-type-row {
  display: flex;
  gap: 6px;
}

.type-pill {
  flex: 1;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background-color: var(--glass-bg-light);
  color: var(--color-light-grey);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-pill.active {
  background-color: var(--glass-red);
  border-color: var(--color-hover);
  color: var(--color-white);
}

.glass-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg-light);
  color: var(--color-white);
  font-size: 12px;
  outline: none;
  resize: none;
}

.glass-input:focus {
  border-color: var(--color-hover);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-light-grey);
  cursor: pointer;
}

.checkbox-row input {
  accent-color: var(--color-hover);
}

.send-broadcast-btn {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-hover);
  background-color: var(--glass-red);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-broadcast-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
