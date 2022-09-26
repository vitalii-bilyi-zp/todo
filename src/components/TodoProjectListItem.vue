<script setup lang="ts">
import EditableText from "@/components/EditableText.vue";
import TodoProjectListItemSubtaskForm from "@/components/TodoProjectListItemSubtaskForm.vue";

import type { CreateTaskDto, UpdateTaskDto, Task } from "@/interfaces";
import { type Ref, inject, computed, ref } from "vue";
import { searchTermKey } from "@/keys";

interface Props {
    task: Task;
}
const props = defineProps<Props>();

interface Emits {
    (e: "createSubtask", task: CreateTaskDto): void;
    (e: "updateTask", task: UpdateTaskDto): void;
    (e: "deleteTask", id: string): void;
}
const emit = defineEmits<Emits>();

const searchTerm = inject<Ref<string>>(searchTermKey);
const taskNameHtml = computed<string>(() => {
    if (!searchTerm?.value) {
        return props.task.name;
    }

    const query: string = searchTerm.value as string;
    const regExp = new RegExp(query, "i");
    return props.task.name.replace(regExp, '<span class="search-term">$&</span>');
});

const taskIsDone = computed<boolean>({
    get() {
        return !!props.task.isDone;
    },
    set(newValue: boolean) {
        emit("updateTask", {
            ...props.task,
            isDone: newValue,
        });
    },
});

const menuState: Ref<boolean> = ref(false);
function toggleMenuState(): void {
    menuState.value = !menuState.value;
}
// eslint-disable-next-line @typescript-eslint/ban-types
function closeMenuWithAction<T extends Function>(func: T): void {
    func();
    closeMenu();
}
function closeMenu(): void {
    menuState.value = false;
}

const newTaskName: Ref<string> = ref(props.task.name);
const taskNameError: Ref<string> = ref("");
const editState: Ref<boolean> = ref(false);
function startEditing(): void {
    if (editState.value) {
        return;
    }

    newTaskName.value = props.task.name;
    editState.value = true;
}
function stopEditing(): void {
    if (!editState.value) {
        return;
    }

    if (!newTaskName.value) {
        taskNameError.value = "This field is mandatory";
        return;
    }

    editState.value = false;
    emit("updateTask", {
        ...props.task,
        name: newTaskName.value,
    });
}

function deleteTask(): void {
    emit("deleteTask", props.task._id);
}

const detailsState: Ref<boolean> = ref(false);
function toggleDetails(): void {
    detailsState.value = !detailsState.value;
}

const subtaskFormState: Ref<boolean> = ref(false);
const showDetails = computed<boolean>(() => {
    return subtaskFormState.value || !!props.task.subtasks?.length;
});
function openSubtaskForm(): void {
    subtaskFormState.value = true;
    detailsState.value = true;
}
function closeSubtaskForm(): void {
    subtaskFormState.value = false;
}

function createSubtask(name: string): void {
    const task: CreateTaskDto = {
        parentId: props.task._id,
        name: name,
        index: props.task.subtasks?.length || 0,
    };
    emit("createSubtask", task);
}
</script>

<template>
    <div class="todo-list-item-wrapper">
        <div class="todo-list-item" :class="{ 'is-done': taskIsDone }">
            <div class="item-checkbox">
                <label class="checkbox">
                    <input type="checkbox" v-model="taskIsDone" />
                </label>
            </div>

            <EditableText
                class="item-text"
                :is-editing="editState"
                :error="taskNameError"
                v-model="newTaskName"
                @update:modelValue="taskNameError = ''"
                @submit="stopEditing"
                @blur="stopEditing"
            >
                <p class="task-name" v-html="taskNameHtml"></p>
            </EditableText>

            <div class="dropdown is-right" :class="{ 'is-active': menuState }" v-click-outside="closeMenu">
                <div class="dropdown-trigger">
                    <button
                        class="button is-text"
                        aria-haspopup="true"
                        aria-controls="dropdown-menu"
                        @click="toggleMenuState"
                    >
                        <span class="icon">
                            <i class="mdi mdi-dots-vertical" aria-hidden="true"></i>
                        </span>
                    </button>
                </div>
                <div class="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <a class="dropdown-item" @click="closeMenuWithAction(openSubtaskForm)">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="mdi mdi-plus-thick"></i>
                                </span>
                                <span>Add subtask</span>
                            </span>
                        </a>
                        <a class="dropdown-item" @click="closeMenuWithAction(startEditing)">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="mdi mdi-pencil"></i>
                                </span>
                                <span>Edit task</span>
                            </span>
                        </a>
                        <a class="dropdown-item" @click="closeMenuWithAction(deleteTask)">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="mdi mdi-delete"></i>
                                </span>
                                <span>Delete task</span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>

            <button v-if="showDetails" class="button is-text" @click="toggleDetails">
                <span class="icon">
                    <i
                        class="mdi"
                        :class="[detailsState ? 'mdi-chevron-up' : 'mdi-chevron-down']"
                        aria-hidden="true"
                    ></i>
                </span>
            </button>
        </div>

        <div v-if="showDetails" class="todo-list-item-details" :class="{ 'is-active': detailsState }">
            <TodoProjectListItemSubtaskForm
                v-if="subtaskFormState"
                class="subtask-form"
                @submit="createSubtask"
                @close="closeSubtaskForm"
            />

            <ul v-if="props.task.subtasks?.length" class="todo-list" :data-parent-id="props.task._id">
                <li v-for="task in props.task.subtasks" :key="task._id" :data-id="task._id" class="is-draggable">
                    <TodoProjectListItem
                        :task="task"
                        @create-subtask="emit('createSubtask', $event)"
                        @update-task="emit('updateTask', $event)"
                        @delete-task="emit('deleteTask', $event)"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped lang="scss">
.todo-list-item {
    display: flex;
    align-items: flex-start;
    padding: 10px 15px;

    &.is-done {
        .item-text {
            .task-name {
                text-decoration: line-through;
            }
        }
    }

    .item-checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2.5em;
        margin-right: 15px;
    }

    .item-text {
        flex-grow: 1;
        margin-right: 20px;

        &:not(.is-editing) {
            overflow: hidden;
        }

        .task-name {
            min-height: 2.5em;
            padding-top: calc(0.5em - 1px);
            overflow: hidden;
            text-overflow: ellipsis;
        }

        :deep(.search-term) {
            font-weight: 500;
        }
    }

    .dropdown {
        &:not(:last-child) {
            margin-right: 5px;
        }
    }
}

.todo-list-item-details {
    display: none;
    padding: 10px 15px;
    background-color: #eeeef4;

    &.is-active {
        display: block;
    }
}

.subtask-form {
    width: 100%;

    &:not(:last-child) {
        margin-bottom: 10px;
    }
}
</style>
