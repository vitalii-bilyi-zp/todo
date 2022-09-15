<script setup lang="ts">
import EditableText from "@/components/EditableText.vue";
import TodoProjectListItemSubtaskForm from "@/components/TodoProjectListItemSubtaskForm.vue";

import type { Task } from "@/interfaces";
import type { Ref } from "vue";
import { inject, computed, ref } from "vue";
import { searchTermKey } from "@/keys";

interface Props {
    task: Task;
}
const props = defineProps<Props>();

interface Emits {
    (e: "createSubtask", task: Task): void;
    (e: "updateTask", task: Task): void;
    (e: "deleteTask", id: string | number): void;
}
const emit = defineEmits<Emits>();

const searchTerm = inject<Ref<string | null>>(searchTermKey);
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
    emit("deleteTask", props.task.id);
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
    const task: Task = {
        id: Date.now(),
        parentId: props.task.id,
        name: name,
        isDone: false,
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

            <div class="dropdown is-right" :class="{ 'is-active': menuState }">
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
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
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
            <ul class="todo-list">
                <li v-if="subtaskFormState">
                    <div class="todo-list-item">
                        <TodoProjectListItemSubtaskForm
                            class="item-form"
                            @submit="createSubtask"
                            @close="closeSubtaskForm"
                        />
                    </div>
                </li>
                <li v-for="task in props.task.subtasks" :key="task.id">
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

<style scoped lang="scss"></style>
