<script setup lang="ts">
import EditableText from "@/components/EditableText.vue";

import type { UpdateProjectDto, Project } from "@/interfaces";
import { type Ref, ref } from "vue";

interface Props {
    project: Project;
}
const props = defineProps<Props>();

interface Emits {
    (e: "updateProject", project: UpdateProjectDto): void;
}
const emit = defineEmits<Emits>();

const newProjectName: Ref<string> = ref(props.project.name);
const projectNameError: Ref<string> = ref("");
const editState: Ref<boolean> = ref(false);
function startEditing(): void {
    if (editState.value) {
        return;
    }

    newProjectName.value = props.project.name;
    editState.value = true;
}
function stopEditing(): void {
    if (!editState.value) {
        return;
    }

    if (!newProjectName.value) {
        projectNameError.value = "This field is mandatory";
        return;
    }

    editState.value = false;
    emit("updateProject", {
        ...props.project,
        name: newProjectName.value,
    });
}
</script>

<template>
    <div class="project-header">
        <button :disabled="editState" class="button is-text" @click="startEditing">
            <span class="icon">
                <i class="mdi mdi-pencil"></i>
            </span>
        </button>
        <EditableText
            class="header-text"
            :is-editing="editState"
            :error="projectNameError"
            v-model="newProjectName"
            @update:modelValue="projectNameError = ''"
            @submit="stopEditing"
            @blur="stopEditing"
        >
            <p class="project-name">{{ props.project.name }}</p>
        </EditableText>
    </div>
</template>

<style scoped lang="scss">
.project-header {
    display: flex;
    align-items: flex-start;

    .button {
        margin-right: 5px;
    }

    .header-text {
        flex-grow: 1;

        .project-name {
            font-weight: 700;
            min-height: 2.5em;
            padding-top: calc(0.5em - 1px);
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>
