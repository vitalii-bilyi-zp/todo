<script setup lang="ts">
import TodoProjectHeader from "@/components/TodoProjectHeader.vue";
import TodoProjectItemCreationForm from "@/components/TodoProjectItemCreationForm.vue";
import TodoProjectList from "@/components/TodoProjectList.vue";

import { ref } from "vue";
import type { Ref } from "vue";

const items: Ref<string[]> = ref([]);
function onSubmit(task: string) {
    items.value.push(task);
}
</script>

<template>
    <div class="todo-project">
        <div class="project-item">
            <TodoProjectHeader />
        </div>
        <div class="project-item">
            <TodoProjectItemCreationForm @submit="onSubmit" />
        </div>
        <div class="project-item">
            <TodoProjectList :items="items" />
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
