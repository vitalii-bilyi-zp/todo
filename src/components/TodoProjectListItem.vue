<script setup lang="ts">
import EditableText from "@/components/EditableText.vue";

import type { Task } from "@/interfaces";
import type { Ref } from "vue";
import { inject, computed, ref } from "vue";
import { searchTermKey } from "@/keys";

interface Props {
    task: Task;
}
const props = defineProps<Props>();

interface Emits {
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
</script>

<template>
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
                    <a class="dropdown-item">
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
    </div>
</template>

<style scoped lang="scss">
.todo-list-item {
    display: flex;
    align-items: flex-start;
    padding: 15px 20px;
    margin: 6px 0px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e7eaef;
    box-shadow: 0px 1px 3px 0px rgb(5 10 23 / 7%);

    &.is-done {
        .item-text {
            .task-name {
                text-decoration: line-through;
            }
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
        padding-top: 0.5em;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :deep(.search-term) {
        font-weight: 500;
    }
}
</style>
