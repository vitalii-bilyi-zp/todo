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
import { type Draggable, useDraggable } from "@/composables/draggable";
import { moveInArray, insertToArray } from "@/utils";

const store = useStore();

onMounted(() => {
    initProject();
});
async function initProject() {
    if (store.state.projectId) {
        await getProjectWithTasks(store.state.projectId);
    } else {
        await createNewProject();
    }

    nextTick(() => {
        initDraggableElements();
    });
}
async function getProjectWithTasks(id: string) {
    await store.dispatch(ActionTypes.GET_PROJECT, id);
    await store.dispatch(ActionTypes.GET_TASKS, id);
}
async function createNewProject() {
    const project: CreateProjectDto = {
        name: "My Todo List",
    };
    await store.dispatch(ActionTypes.CREATE_PROJECT, project);
}
function updateProject(project: UpdateProjectDto) {
    store.dispatch(ActionTypes.UPDATE_PROJECT, project);
}

const list = ref<HTMLElement | null>(null);
const { dragResponse, initDraggableElements, addDraggableElement }: Draggable = useDraggable(list.value);

watch(dragResponse, ({ prevId, nextId }: { prevId: string; nextId: string }) => {
    const prevTaskData = findTaskWithNeighboursRecursively(prevId, store.state.tasks);
    const nextTaskData = findTaskWithNeighboursRecursively(nextId, store.state.tasks);

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
async function updateOneLevelTasks(prevTaskData: TaskWithNeighbours, nextTaskData: TaskWithNeighbours) {
    let targetList = nextTaskData.neighbours.slice();
    moveInArray(targetList, prevTaskData.task.index, nextTaskData.task.index);
    targetList = targetList.map((task: Task, index: number) => {
        return {
            ...task,
            index,
        };
    });

    await store.dispatch(ActionTypes.UPDATE_TASKS, targetList);

    if (!store.state.projectId) {
        return;
    }

    store.dispatch(ActionTypes.GET_TASKS, store.state.projectId);
}
async function updateDifferentLevelsTasks(prevTaskData: TaskWithNeighbours, nextTaskData: TaskWithNeighbours) {
    let prevList = prevTaskData.neighbours.slice();
    let nextList = nextTaskData.neighbours.slice();
    const prevTask = {
        ...prevTaskData.task,
        parentId: nextTaskData.task.parentId,
    };

    prevList.splice(prevTaskData.task.index, 1);
    prevList = prevList.map((task: Task, index: number) => {
        return {
            ...task,
            index,
        };
    });

    insertToArray(nextList, nextTaskData.task.index + 1, prevTask);
    nextList = nextList.map((task: Task, index: number) => {
        return {
            ...task,
            index,
        };
    });

    await store.dispatch(ActionTypes.UPDATE_TASKS, prevList.concat(nextList));

    if (!store.state.projectId) {
        return;
    }

    store.dispatch(ActionTypes.GET_TASKS, store.state.projectId);
}

const searchTerm: Ref<string> = ref("");
provide(searchTermKey, searchTerm);
function searchTasks(term: string) {
    searchTerm.value = term;

    if (store.state.searchHistory.includes(term)) {
        return;
    }

    store.dispatch(ActionTypes.SET_SEARCH_HISTORY, [...store.state.searchHistory, term]);
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
    const savedTask = await store.dispatch(ActionTypes.CREATE_TASK, task);

    if (!savedTask) {
        return;
    }

    await store.dispatch(ActionTypes.GET_TASKS, store.state.projectId);

    nextTick(() => {
        addDraggableElement(savedTask._id);
    });
}
async function createSubtask(task: CreateTaskDto) {
    const savedTask = await store.dispatch(ActionTypes.CREATE_TASK, task);

    if (!savedTask || !store.state.projectId) {
        return;
    }

    await store.dispatch(ActionTypes.GET_TASKS, store.state.projectId);

    nextTick(() => {
        addDraggableElement(savedTask._id);
    });
}
async function updateTask(task: UpdateTaskDto) {
    await store.dispatch(ActionTypes.UPDATE_TASKS, [task]);

    if (!store.state.projectId) {
        return;
    }

    store.dispatch(ActionTypes.GET_TASKS, store.state.projectId);
}
async function deleteTask(id: string) {
    const taskData = findTaskWithNeighboursRecursively(id, store.state.tasks);
    if (taskData) {
        let targetList = taskData.neighbours.slice();
        targetList.splice(taskData.task.index, 1);
        targetList = targetList.map((task: Task, index: number) => {
            return {
                ...task,
                index,
            };
        });

        await store.dispatch(ActionTypes.UPDATE_TASKS, targetList);
    }

    await store.dispatch(ActionTypes.DELETE_TASK, id);

    if (!store.state.projectId) {
        return;
    }

    store.dispatch(ActionTypes.GET_TASKS, store.state.projectId);
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

// function exportProject(): void {
//     const jsonData = JSON.stringify({
//         project: store.state.project,
//         tasks: store.state.tasks,
//     });
//     exportData(jsonData, `${store.state.project.name}.json`, "application/json");
// }

// const fileInput = ref<HTMLInputElement | null>(null);
// function importProject(event: Event): void {
//     const target = event.target as HTMLInputElement;
//     const file: File | null = target.files && target.files.length ? target.files[0] : null;
//     if (!file) {
//         return;
//     }
//     const reader = new FileReader();
//     reader.onloadend = () => {
//         try {
//             const object = JSON.parse(reader.result as string);
//             if (validateProjectStructure(object)) {
//                 store.dispatch(ActionTypes.SET_PROJECT, object.project);
//                 store.dispatch(ActionTypes.SET_TASKS, object.tasks || []);
//                 if (fileInput.value) {
//                     fileInput.value.value = "";
//                 }
//                 alert("Project was imported successfully");
//             } else {
//                 alert("Invalid file format");
//             }
//         } catch {
//             alert("Invalid file format");
//         }
//     };
//     reader.onerror = () => {
//         alert("Sorry, there was an unexpected error, please try again");
//     };
//     reader.readAsText(file, "UTF-8");
// }
// function validateProjectStructure(object: any): boolean {
//     try {
//         if (!object.project || !isProject(object.project)) {
//             return false;
//         }
//         if (object.tasks) {
//             return object.tasks.every(isTask);
//         }
//         return true;
//     } catch {
//         return false;
//     }
// }
</script>

<template>
    <div v-if="store.state.project" class="todo-project">
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
                :tasks="filteredTasks"
                @create-subtask="createSubtask"
                @update-task="updateTask"
                @delete-task="deleteTask"
            />
        </div>
        <!-- <div class="project-item">
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
        </div> -->
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
