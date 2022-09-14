<script setup lang="ts">
import type { Task } from "@/interfaces";

interface Props {
    task: Task;
}
const props = defineProps<Props>();

interface Emits {
    (e: "updateTask", task: Task): void;
    (e: "deleteTask", id: string | number): void;
}
const emit = defineEmits<Emits>();

function toggleTask(): void {
    emit("updateTask", {
        ...props.task,
        isDone: !props.task.isDone,
    });
}

function deleteTask(): void {
    emit("deleteTask", props.task.id);
}
</script>

<template>
    <div class="todo-list-item" :class="{ 'is-done': props.task.isDone }" @click="toggleTask">
        <p class="item-label">{{ props.task.name }}</p>
        <div class="item-actions">
            <button class="button is-small is-danger is-outlined" @click="deleteTask">
                <span class="icon is-small">
                    <i class="mdi mdi-delete"></i>
                </span>
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.todo-list-item {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    margin: 6px 0px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e7eaef;
    box-shadow: 0px 1px 3px 0px rgb(5 10 23 / 7%);
    overflow: hidden;
    cursor: pointer;

    &:hover {
        box-shadow: 0px 1px 3px 0px rgb(5 10 23 / 20%);
    }

    &.is-done {
        .item-label {
            text-decoration: line-through;
        }
    }
}

.item-label {
    flex-grow: 1;
    margin-right: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
