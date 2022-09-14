<script setup lang="ts">
import TodoProjectListItem from "@/components/TodoProjectListItem.vue";

import type { Task } from "@/interfaces";

interface Props {
    tasks: Task[];
}
const props = withDefaults(defineProps<Props>(), {
    tasks: () => [],
});

interface Emits {
    (e: "updateTask", task: Task): void;
    (e: "deleteTask", id: string | number): void;
}
const emit = defineEmits<Emits>();

function updateTask(task: Task): void {
    emit("updateTask", task);
}

function deleteTask(id: string | number): void {
    emit("deleteTask", id);
}
</script>

<template>
    <div class="menu">
        <ul class="menu-list">
            <li v-for="(task, index) in props.tasks" :key="index">
                <TodoProjectListItem :task="task" @update-task="updateTask" @delete-task="deleteTask" />
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
