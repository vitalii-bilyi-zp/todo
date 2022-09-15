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

const newTaskName: Ref<string> = ref(props.task.name);
const taskNameError: Ref<string> = ref("");
const isEditing: Ref<boolean> = ref(false);
function toggleEditing(): void {
    if (isEditing.value) {
        stopEditing();
    } else {
        startEditing();
    }
}
function startEditing(): void {
    newTaskName.value = props.task.name;
    isEditing.value = true;
}
function stopEditing(): void {
    if (!newTaskName.value) {
        taskNameError.value = "This field is mandatory";
        return;
    }

    isEditing.value = false;
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
        <label class="checkbox">
            <input type="checkbox" v-model="taskIsDone" />
        </label>

        <EditableText
            class="item-text"
            :is-editing="isEditing"
            :error="taskNameError"
            v-model="newTaskName"
            @update:modelValue="taskNameError = ''"
            @submit="stopEditing"
        >
            <p class="task-name" v-html="taskNameHtml"></p>
        </EditableText>

        <div class="item-actions">
            <button class="button is-text" :class="{ 'is-active': isEditing }" @click="toggleEditing">
                <span class="icon">
                    <i class="mdi mdi-pencil"></i>
                </span>
            </button>
            <button class="button is-text" @click="deleteTask">
                <span class="icon">
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

    &.is-done {
        .item-text {
            .task-name {
                text-decoration: line-through;
            }
        }
    }

    .checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
    }
}

.item-text {
    flex-grow: 1;
    margin-right: 20px;
    overflow: hidden;

    .task-name {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :deep(.search-term) {
        font-weight: 500;
    }
}

.item-actions {
    display: flex;
    align-items: center;

    .button {
        .icon {
            opacity: 0.7;
        }

        &:hover,
        &.is-active {
            .icon {
                opacity: 1;
            }
        }

        & + .button {
            margin-left: 5px;
        }
    }
}
</style>
