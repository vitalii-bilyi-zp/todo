<script setup lang="ts">
import TodoProjectHeader from "@/components/TodoProjectHeader.vue";
import TodoProjectSearchForm from "@/components/TodoProjectSearchForm.vue";
import TodoProjectTaskForm from "@/components/TodoProjectTaskForm.vue";
import TodoProjectList from "@/components/TodoProjectList.vue";

import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";

import type { Project, Task } from "@/interfaces";
import { type Ref, onBeforeMount, ref, computed, provide, reactive, watch } from "vue";
import { type Draggable, useDraggable } from "@/composables/draggable";
import { searchTermKey } from "@/keys";

const store = useStore();

onBeforeMount(() => {
    initProject();
});

function initProject(): void {
    if (store.state.project) {
        return;
    }

    const project: Project = {
        id: Date.now().toString(),
        name: "My Todo List",
    };
    store.dispatch(ActionTypes.SET_PROJECT, project);
}

function createTask(name: string): void {
    const task: Task = {
        id: Date.now().toString(),
        name: name,
        isDone: false,
        order: groupedTasks.value.length,
    };
    store.dispatch(ActionTypes.CREATE_TASK, task);
}

function createSubtask(task: Task): void {
    store.dispatch(ActionTypes.CREATE_TASK, task);
}

function updateTask(task: Task): void {
    store.dispatch(ActionTypes.UPDATE_TASK, task);
}

function deleteTask(id: string): void {
    store.dispatch(ActionTypes.DELETE_TASK, id);
}

const searchTerm: Ref<string | null> = ref(null);
provide(searchTermKey, searchTerm);
function setSearchTerm(term: string | null): void {
    searchTerm.value = term;
}

const groupedTasks = computed<Task[]>(() => {
    const parentsGroup = store.state.tasks.reduce((prev: Record<string, Task[]>, curr: Task) => {
        const parentId = curr.parentId || "root";
        const group = prev[parentId] || [];

        prev[parentId] = [...group, curr];

        return prev;
    }, {});

    const collectSubtasksRecursively = (task: Task): Task => {
        const subtasks = parentsGroup[task.id] || [];

        return {
            ...task,
            subtasks: subtasks.map((task: Task) => collectSubtasksRecursively(task)),
        };
    };

    const rootTasks = parentsGroup["root"] || [];
    return rootTasks.map((task: Task) => collectSubtasksRecursively(task));
});

const filteredTasks = computed<Task[]>(() => {
    if (!searchTerm.value) {
        return groupedTasks.value;
    }

    const query: string = searchTerm.value as string;

    const filterTasksRecursively = (tasks: Task[]): Task[] => {
        return tasks.reduce((prev: Task[], curr: Task) => {
            if (curr.name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                prev.push(curr);
            }

            const subtasks = filterTasksRecursively(curr.subtasks || []);
            if (subtasks.length) {
                prev.push({
                    ...curr,
                    subtasks,
                });
            }

            return prev;
        }, []);
    };

    return filterTasksRecursively(groupedTasks.value);
});

const list = ref<HTMLElement | null>(null);
const { dragResponse }: Draggable = useDraggable(list.value);
watch(dragResponse, ({ prevId, nextId }: { prevId: string; nextId: string }) => {
    console.log("TEST", prevId, nextId);
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
            <TodoProjectTaskForm @submit="createTask" />
        </div>
        <div v-if="filteredTasks.length" ref="list" class="project-item">
            <TodoProjectList
                :tasks="filteredTasks"
                @create-subtask="createSubtask"
                @update-task="updateTask"
                @delete-task="deleteTask"
            />
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
