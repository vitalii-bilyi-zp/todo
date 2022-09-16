<script setup lang="ts">
import TodoProjectListItem from "@/components/TodoProjectListItem.vue";

import type { Task } from "@/interfaces";

import { ref } from "vue";

import { type Draggable, useDraggable } from "@/composables/draggable";

interface Props {
    tasks: Task[];
}
const props = withDefaults(defineProps<Props>(), {
    tasks: () => [],
});

interface Emits {
    (e: "createSubtask", task: Task): void;
    (e: "updateTask", task: Task): void;
    (e: "deleteTask", id: string | number): void;
}
const emit = defineEmits<Emits>();

function createSubtask(task: Task): void {
    emit("createSubtask", task);
}

function updateTask(task: Task): void {
    emit("updateTask", task);
}

function deleteTask(id: string | number): void {
    emit("deleteTask", id);
}

const list = ref<HTMLElement | null>(null);
const { currentElement, newElement }: Draggable = useDraggable(list.value);
</script>

<template>
    <ul ref="list" class="todo-list">
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
