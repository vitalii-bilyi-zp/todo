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
    (e: "createSubtask", task: Task): void;
    (e: "updateTask", task: Task): void;
    (e: "deleteTask", id: string): void;
}
const emit = defineEmits<Emits>();

function createSubtask(task: Task): void {
    emit("createSubtask", task);
}

function updateTask(task: Task): void {
    emit("updateTask", task);
}

function deleteTask(id: string): void {
    emit("deleteTask", id);
}
</script>

<template>
    <ul class="todo-list">
        <li v-for="task in props.tasks" :key="task.id" :data-id="task.id" draggable="true">
            <TodoProjectListItem
                :task="task"
                @create-subtask="createSubtask"
                @update-task="updateTask"
                @delete-task="deleteTask"
            />
        </li>
    </ul>
</template>

<style scoped lang="scss"></style>
