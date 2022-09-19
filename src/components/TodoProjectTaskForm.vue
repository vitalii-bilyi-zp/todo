<script setup lang="ts">
import { type Ref, ref } from "vue";

interface Emits {
    (e: "submit", task: string): void;
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
</script>

<template>
    <form class="task-creation-form" @submit.prevent="onSubmit">
        <input v-model="task" class="input" type="text" placeholder="What needs to be done?" />
        <button type="submit" class="button is-link is-outlined" :disabled="!task">
            <span class="icon button-icon">
                <i class="mdi mdi-plus"></i>
            </span>
            <span class="button-label">Add Task</span>
        </button>
    </form>
</template>

<style scoped lang="scss">
.task-creation-form {
    display: flex;
    align-items: center;

    .input {
        margin-right: 20px;
    }
}

@media screen and (max-width: 500px) {
    .task-creation-form {
        .button {
            .button-icon {
                margin-left: calc(-0.5em - 1px) !important;
                margin-right: calc(-0.5em - 1px) !important;
            }

            .button-label {
                display: none;
            }
        }
    }
}
</style>
