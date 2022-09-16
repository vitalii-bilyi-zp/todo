<script setup lang="ts">
import TodoProjectHeader from "@/components/TodoProjectHeader.vue";
import TodoProjectSearchForm from "@/components/TodoProjectSearchForm.vue";
import TodoProjectTaskForm from "@/components/TodoProjectTaskForm.vue";
import TodoProjectList from "@/components/TodoProjectList.vue";

import { searchTermKey } from "@/keys";

import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";

import type { Project, Task } from "@/interfaces";
import { isProject, isTask } from "@/interfaces/guards";

import { type Ref, onBeforeMount, ref, computed, provide, watch } from "vue";
import { type Draggable, useDraggable } from "@/composables/draggable";
import { exportData, moveInArray, insertToArray } from "@/utils";

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
        index: groupedTasks.value.length,
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
    const taskData = findTaskWithNeighboursRecursively(id, groupedTasks.value);
    if (taskData) {
        const targetList = taskData.neighbours.slice();
        targetList.splice(taskData.task.index, 1);
        targetList.forEach((task: Task, index: number) => {
            store.dispatch(ActionTypes.UPDATE_TASK, {
                ...task,
                index,
                subtasks: [],
            });
        });
    }

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

    for (const id in parentsGroup) {
        parentsGroup[id].sort((a: Task, b: Task) => a.index - b.index);
    }

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
type TaskWithNeighbours = { task: Task; neighbours: Task[] };
watch(dragResponse, ({ prevId, nextId }: { prevId: string; nextId: string }) => {
    const prevTaskData = findTaskWithNeighboursRecursively(prevId, groupedTasks.value);
    const nextTaskData = findTaskWithNeighboursRecursively(nextId, groupedTasks.value);

    if (!prevTaskData || !nextTaskData) {
        return;
    }

    if (prevTaskData.task.parentId === nextTaskData.task.parentId) {
        updateOneLevelTasks(prevTaskData, nextTaskData);
    } else {
        updateDifferentLevelsTasks(prevTaskData, nextTaskData);
    }
});
function findTaskWithNeighboursRecursively(id: string, tasks: Task[]): TaskWithNeighbours | null {
    for (const task of tasks) {
        if (task.id === id) {
            return { task, neighbours: tasks };
        }
        const subtasksResponse = findTaskWithNeighboursRecursively(id, task.subtasks || []);
        if (subtasksResponse) {
            return subtasksResponse;
        }
    }

    return null;
}
function updateOneLevelTasks(prevTaskData: TaskWithNeighbours, nextTaskData: TaskWithNeighbours): void {
    const targetList = nextTaskData.neighbours.slice();
    moveInArray(targetList, prevTaskData.task.index, nextTaskData.task.index);
    targetList.forEach((task: Task, index: number) => {
        store.dispatch(ActionTypes.UPDATE_TASK, {
            ...task,
            index,
            subtasks: [],
        });
    });
}
function updateDifferentLevelsTasks(prevTaskData: TaskWithNeighbours, nextTaskData: TaskWithNeighbours): void {
    const prevList = prevTaskData.neighbours.slice();
    const nextList = nextTaskData.neighbours.slice();
    const prevTask = {
        ...prevTaskData.task,
        parentId: nextTaskData.task.parentId,
    };

    prevList.splice(prevTaskData.task.index, 1);
    prevList.forEach((task: Task, index: number) => {
        store.dispatch(ActionTypes.UPDATE_TASK, {
            ...task,
            index,
            subtasks: [],
        });
    });

    insertToArray(nextList, nextTaskData.task.index + 1, prevTask);
    nextList.forEach((task: Task, index: number) => {
        store.dispatch(ActionTypes.UPDATE_TASK, {
            ...task,
            index,
            subtasks: [],
        });
    });
}

function exportProject(): void {
    const jsonData = JSON.stringify({
        project: store.state.project,
        tasks: store.state.tasks,
    });
    exportData(jsonData, `${store.state.project.name}.json`, "application/json");
}

const fileInput = ref<HTMLInputElement | null>(null);
function importProject(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file: File | null = target.files && target.files.length ? target.files[0] : null;

    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        try {
            const object = JSON.parse(reader.result as string);
            if (validateProjectStructure(object)) {
                store.dispatch(ActionTypes.SET_PROJECT, object.project);
                store.dispatch(ActionTypes.SET_TASKS, object.tasks || []);
                if (fileInput.value) {
                    fileInput.value.value = "";
                }
                alert("Project was imported successfully");
            } else {
                alert("Invalid file format");
            }
        } catch {
            alert("Invalid file format");
        }
    };
    reader.onerror = () => {
        alert("Sorry, there was an unexpected error, please try again");
    };
    reader.readAsText(file, "UTF-8");
}
function validateProjectStructure(object: any): boolean {
    try {
        if (!object.project || !isProject(object.project)) {
            return false;
        }
        if (object.tasks) {
            return object.tasks.every(isTask);
        }
        return true;
    } catch {
        return false;
    }
}
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
        <div class="project-item">
            <div class="project-actions">
                <button class="button" @click="exportProject">
                    <span class="icon">
                        <i class="mdi mdi-download"></i>
                    </span>
                    <span>Export project</span>
                </button>

                <div class="file is-white">
                    <label class="file-label">
                        <input
                            ref="fileInput"
                            class="file-input"
                            type="file"
                            name="resume"
                            accept="application/json"
                            @change="importProject"
                        />
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="mdi mdi-upload"></i>
                            </span>
                            <span class="file-label">Import project</span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.project-item {
    &:not(:last-child) {
        margin-bottom: 20px;
    }
}

.project-actions {
    display: flex;
    align-items: center;
    justify-content: center;

    .button {
        margin-right: 20px;
    }

    .file-label {
        border-radius: 4px;

        .file-cta {
            border-color: hsl(0deg, 0%, 86%);
            color: hsl(0deg, 0%, 21%);
        }

        &:hover {
            .file-cta {
                background-color: hsl(0deg, 0%, 100%);
                border-color: hsl(0deg, 0%, 71%);
                color: hsl(0deg, 0%, 21%);
            }
        }

        &:active {
            .file-cta {
                background-color: hsl(0deg, 0%, 100%);
                border-color: hsl(0deg, 0%, 29%);
                color: hsl(0deg, 0%, 21%);
            }
        }
    }
}
</style>
