<script setup lang="ts">
import { type Ref, ref, onMounted } from "vue";

interface Emits {
    (e: "submit", task: string): void;
    (e: "close"): void;
}
const emit = defineEmits<Emits>();

const task: Ref<string | null> = ref(null);
function onSubmit() {
    if (!task.value) {
        return;
    }

    emit("submit", task.value);
    task.value = null;
}
function onClose() {
    emit("close");
}

const input = ref<HTMLElement | null>(null);
onMounted(() => {
    focusOnInput();
});
function focusOnInput() {
    if (!input.value) {
        return;
    }
    input.value.focus();
}
</script>

<template>
    <form class="subtask-creation-form" @submit.prevent>
        <input ref="input" v-model="task" class="input" type="text" placeholder="Type here..." />
        <div class="form-actions">
            <button class="button is-text" :disabled="!task" @click="onSubmit">
                <span class="icon">
                    <i class="mdi mdi-check" aria-hidden="true"></i>
                </span>
            </button>
            <button class="button is-text" @click="onClose">
                <span class="icon">
                    <i class="mdi mdi-cancel" aria-hidden="true"></i>
                </span>
            </button>
        </div>
    </form>
</template>

<style scoped lang="scss">
.subtask-creation-form {
    display: flex;
    align-items: center;

    .input {
        margin-right: 20px;
    }
}

.form-actions {
    display: flex;
    align-items: center;

    .button {
        & + .button {
            margin-left: 5px;
        }
    }
}
</style>
