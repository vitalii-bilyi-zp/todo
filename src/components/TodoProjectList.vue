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

<style scoped lang="scss">
.todo-list,
:deep(.todo-list) {
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #d9d9d9;

    li {
        &:first-child {
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }

        &:last-child {
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        &:not(:last-child) {
            border-bottom: 1px solid #e7eaef;
        }

        &[draggable="true"] {
            cursor: move;

            &.over {
                box-shadow: 0 0 0 0.125em rgb(72 95 199 / 25%);
            }
        }
    }
}
</style>
