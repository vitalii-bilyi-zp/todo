<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";

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
    <form class="item-creation-form" @submit.prevent="onSubmit">
        <input v-model="task" class="input" type="text" placeholder="What needs to be done?" />
        <input type="submit" value="Add Task" class="button is-link is-outlined" />
    </form>
</template>

<style scoped lang="scss">
.item-creation-form {
    display: flex;
    align-items: center;

    .input {
        margin-right: 20px;
    }
}
</style>
