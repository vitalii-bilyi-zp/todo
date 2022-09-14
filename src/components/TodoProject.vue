<script setup lang="ts">
import TodoProjectHeader from "@/components/TodoProjectHeader.vue";
import TodoProjectItemCreationForm from "@/components/TodoProjectItemCreationForm.vue";
import TodoProjectList from "@/components/TodoProjectList.vue";

import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";

import type { Project, Task } from "@/interfaces";
import { onBeforeMount } from "vue";

const store = useStore();

onBeforeMount(() => {
    initProject();
});

function initProject(): void {
    if (store.state.project) {
        return;
    }

    const project: Project = {
        id: Date.now(),
        name: "My Todo List",
    };
    store.dispatch(ActionTypes.SET_PROJECT, project);
}

function createTask(name: string): void {
    const task: Task = {
        id: Date.now(),
        name: name,
        isDone: false,
        subtasks: [],
    };
    store.dispatch(ActionTypes.CREATE_TASK, task);
}

function updateTask(task: Task): void {
    store.dispatch(ActionTypes.UPDATE_TASK, task);
}

function deleteTask(id: string | number): void {
    store.dispatch(ActionTypes.DELETE_TASK, id);
}
</script>

<template>
    <div class="todo-project">
        <div class="project-item">
            <TodoProjectHeader :title="store.state.project.name" />
        </div>
        <div class="project-item">
            <TodoProjectItemCreationForm @submit="createTask" />
        </div>
        <div class="project-item">
            <TodoProjectList :tasks="store.state.tasks" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.project-item {
    &:not(:last-child) {
        margin-bottom: 20px;
    }
}
</style>
