<script setup lang="ts">
import TodoProjectHeader from "@/components/TodoProjectHeader.vue";
import TodoProjectSearchForm from "@/components/TodoProjectSearchForm.vue";
import TodoProjectTaskForm from "@/components/TodoProjectTaskForm.vue";
import TodoProjectList from "@/components/TodoProjectList.vue";

import { searchTermKey } from "@/keys";

import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";

import type {
    CreateProjectDto,
    UpdateProjectDto,
    CreateTaskDto,
    UpdateTaskDto,
    Task,
    TaskWithNeighbours,
} from "@/interfaces";

import { type Ref, onMounted, ref, computed, provide, watch, nextTick } from "vue";
import { type SortableList, type SortResponse, useSortableList } from "@/composables/sortable-list";
import { moveInArray, insertToArray } from "@/utils";

const store = useStore();

const { sortResponse, initSortableList }: SortableList = useSortableList();
const list = ref<HTMLElement | null>(null);

onMounted(() => {
    initProject();
});
const isLoading: Ref<boolean> = ref(false);
async function initProject() {
    isLoading.value = true;
    try {
        if (store.state.projectId) {
            await store.dispatch(ActionTypes.GET_PROJECT, store.state.projectId);
        } else {
            const project: CreateProjectDto = {
                name: "My Todo List",
            };
            await store.dispatch(ActionTypes.CREATE_PROJECT, project);
        }
    } catch {
        //
    } finally {
        isLoading.value = false;
    }

    nextTick(() => {
        initSortableList(list.value);
    });
}
function updateProject(project: UpdateProjectDto) {
    try {
        store.dispatch(ActionTypes.UPDATE_PROJECT, project);
    } catch {
        //
    }
}

watch(sortResponse, (newValue: SortResponse) => {
    if (newValue.oldParentId === newValue.newParentId) {
        updateOneLevelTasks(newValue);
    } else {
        updateDifferentLevelsTasks(newValue);
    }
});
async function updateOneLevelTasks(sortResponse: SortResponse) {
    let targetList = findTasksByParentId(sortResponse.newParentId, store.state.tasks);
    if (!targetList.length) {
        return;
    }
    targetList = targetList.map((task: Task) => ({
        _id: task._id,
        parentId: task.parentId,
        name: task.name,
        index: task.index,
        isDone: task.isDone,
    }));

    moveInArray(targetList, sortResponse.oldIndex, sortResponse.newIndex);
    targetList = targetList.map((task: Task, index: number) => {
        return {
            ...task,
            index,
        };
    });

    try {
        await store.dispatch(ActionTypes.UPDATE_TASKS, targetList);
        await reloadProject();
        nextTick(() => {
            removeDuplicate(sortResponse.itemId);
        });
    } catch {
        //
    }
}
async function updateDifferentLevelsTasks(sortResponse: SortResponse) {
    let oldList = findTasksByParentId(sortResponse.oldParentId, store.state.tasks);
    if (!oldList.length) {
        return;
    }
    oldList = oldList.map((task: Task) => ({
        _id: task._id,
        parentId: task.parentId,
        name: task.name,
        index: task.index,
        isDone: task.isDone,
    }));

    let newList = findTasksByParentId(sortResponse.newParentId, store.state.tasks);
    if (!newList.length) {
        return;
    }
    newList = newList.map((task: Task) => ({
        _id: task._id,
        parentId: task.parentId,
        name: task.name,
        index: task.index,
        isDone: task.isDone,
    }));

    const oldItem = oldList.splice(sortResponse.oldIndex, 1)[0];
    oldList = oldList.map((task: Task, index: number) => {
        return {
            ...task,
            index,
        };
    });

    oldItem.parentId = sortResponse.newParentId;
    insertToArray(newList, sortResponse.newIndex, oldItem);
    newList = newList.map((task: Task, index: number) => {
        return {
            ...task,
            index,
        };
    });

    try {
        await store.dispatch(ActionTypes.UPDATE_TASKS, oldList.concat(newList));
        await reloadProject();
        nextTick(() => {
            removeDuplicate(sortResponse.itemId);
        });
    } catch {
        //
    }
}
function findTasksByParentId(parentId: string, tasks: Task[]): Task[] {
    if (!tasks.length) {
        return [];
    }
    if (tasks[0].parentId === parentId) {
        return tasks;
    }

    const taskData = findTaskWithNeighboursRecursively(parentId, tasks);
    if (!taskData) {
        return [];
    }

    return taskData.task.subtasks || [];
}
function removeDuplicate(id: string) {
    const duplicate = list.value?.querySelector(`[data-id="${id}"] + [data-id="${id}"]`);
    if (!duplicate) {
        return;
    }
    duplicate.remove();
}

const searchTerm: Ref<string> = ref("");
provide(searchTermKey, searchTerm);
function searchTasks(term: string) {
    searchTerm.value = term;

    if (store.state.searchHistory.includes(term)) {
        return;
    }

    try {
        store.dispatch(ActionTypes.SET_SEARCH_HISTORY, [...store.state.searchHistory, term]);
    } catch {
        //
    }
}

async function createTask(name: string) {
    if (!store.state.projectId) {
        return;
    }

    const task: CreateTaskDto = {
        parentId: store.state.projectId,
        name: name,
        index: store.state.tasks.length,
    };

    try {
        const savedTask = await store.dispatch(ActionTypes.CREATE_TASK, task);
        await reloadProject();

        if (savedTask.index > 0) {
            return;
        }

        nextTick(() => {
            initSortableList(list.value);
        });
    } catch {
        //
    }
}
async function createSubtask(task: CreateTaskDto) {
    try {
        const savedTask = await store.dispatch(ActionTypes.CREATE_TASK, task);
        await reloadProject();

        if (savedTask.index > 0) {
            return;
        }

        nextTick(() => {
            initSortableList(list.value);
        });
    } catch {
        //
    }
}
async function updateTask(task: UpdateTaskDto) {
    try {
        await store.dispatch(ActionTypes.UPDATE_TASKS, [task]);
        reloadProject();
    } catch {
        //
    }
}
async function deleteTask(id: string) {
    let targetList: Task[] = [];
    const taskData = findTaskWithNeighboursRecursively(id, store.state.tasks);
    if (taskData) {
        targetList = taskData.neighbours.slice();
        targetList.splice(taskData.task.index, 1);
        targetList = targetList.map((task: Task, index: number) => {
            return {
                ...task,
                index,
            };
        });
    }

    try {
        await store.dispatch(ActionTypes.DELETE_TASK, id);
        await store.dispatch(ActionTypes.UPDATE_TASKS, targetList);
        reloadProject();
    } catch {
        //
    }
}
function findTaskWithNeighboursRecursively(id: string, tasks: Task[]): TaskWithNeighbours | null {
    for (const task of tasks) {
        if (task._id === id) {
            return { task, neighbours: tasks };
        }

        const subtasksResponse = findTaskWithNeighboursRecursively(id, task.subtasks || []);
        if (subtasksResponse) {
            return subtasksResponse;
        }
    }

    return null;
}
async function reloadProject() {
    if (!store.state.projectId) {
        return;
    }
    await store.dispatch(ActionTypes.GET_PROJECT, store.state.projectId);
}

const filteredTasks = computed<Task[]>(() => {
    if (!searchTerm.value) {
        return store.state.tasks;
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

    return filterTasksRecursively(store.state.tasks);
});

async function exportProject() {
    if (!store.state.projectId) {
        return;
    }

    try {
        const res = await store.dispatch(ActionTypes.EXPORT_PROJECT, store.state.projectId);
        const contentDispositionHeader = res.headers.get("Content-Disposition");
        const fileName = contentDispositionHeader
            ? contentDispositionHeader.replace(/^.+filename="(.+)"$/, "$1")
            : "todo-list";
        const fileBlob = await res.blob();
        const fileURL = URL.createObjectURL(fileBlob);
        const anchor = document.createElement("a");
        anchor.href = fileURL;
        anchor.download = `${fileName}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    } catch {
        //
    }
}

const fileInput = ref<HTMLInputElement | null>(null);
async function importProject(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File | null = target.files && target.files.length ? target.files[0] : null;
    if (!file || !store.state.projectId) {
        return;
    }

    try {
        await store.dispatch(ActionTypes.IMPORT_PROJECT, { id: store.state.projectId, file });
        alert("Project was imported successfully");
    } catch {
        alert("Project import failed");
    }
}
</script>

<template>
    <div class="todo-project">
        <div v-if="isLoading" class="loader-wrapper">
            <div class="loader is-loading"></div>
        </div>

        <template v-else-if="store.state.project">
            <div class="project-item">
                <TodoProjectHeader :project="store.state.project" @update-project="updateProject" />
            </div>
            <div class="project-item">
                <TodoProjectSearchForm :search-history="store.state.searchHistory" @search="searchTasks" />
            </div>
            <div class="project-item">
                <TodoProjectTaskForm @submit="createTask" />
            </div>
            <div v-if="filteredTasks.length" ref="list" class="project-item">
                <TodoProjectList
                    :project-id="store.state.projectId"
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
        </template>
    </div>
</template>

<style scoped lang="scss">
.loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;

    .loader {
        position: relative;
        display: block;
        content: "";
        height: 80px;
        width: 80px;
        animation: spinAround 0.5s infinite linear;
        border: 2px solid #dbdbdb;
        border-radius: 100%;
        border-right-color: transparent;
        border-top-color: transparent;
    }
}

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

    .file {
        & > .file-label {
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
}

@media screen and (max-width: 500px) {
    .project-actions {
        flex-direction: column;

        .button {
            width: 100%;
            margin-right: 0;
            margin-bottom: 20px;
        }

        .file {
            width: 100%;

            & > .file-label {
                width: 100%;

                .file-cta {
                    width: 100%;
                    justify-content: center;
                }
            }
        }
    }
}
</style>
