<script setup lang="ts">
import TodoProjectHeader from "@/components/TodoProjectHeader.vue";
import TodoProjectSearchForm from "@/components/TodoProjectSearchForm.vue";
import TodoProjectItemCreationForm from "@/components/TodoProjectItemCreationForm.vue";
import TodoProjectList from "@/components/TodoProjectList.vue";

import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";

import type { Project, Task } from "@/interfaces";
import type { Ref } from "vue";
import { onBeforeMount, ref, computed } from "vue";

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

const searchTerm: Ref<string | null> = ref(null);
function setSearchTerm(term: string | null): void {
    searchTerm.value = term;
}

const filteredTasks = computed<Task[]>(() => {
    if (!searchTerm.value) {
        return store.getters.computedTasks;
    }

    const query: string = searchTerm.value as string;
    return store.getters.computedTasks.filter((task) => {
        return task.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    });
});
</script>

<template>
    <div class="todo-project">
        <div class="project-item">
            <TodoProjectHeader :title="store.state.project.name" />
        </div>
        <div class="project-item">
            <TodoProjectSearchForm @search="setSearchTerm" />
        </div>
        <div class="project-item">
            <TodoProjectItemCreationForm @submit="createTask" />
        </div>
        <div class="project-item">
            <TodoProjectList :tasks="filteredTasks" @update-task="updateTask" @delete-task="deleteTask" />
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
