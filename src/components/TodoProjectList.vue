<script setup lang="ts">
import TodoProjectListItem from "@/components/TodoProjectListItem.vue";

import type { Task } from "@/interfaces";

interface Props {
    tasks: Task[];
}
const props = withDefaults(defineProps<Props>(), {
    tasks: () => [],
});
</script>

<template>
    <div class="menu">
        <ul class="menu-list">
            <li v-for="(task, index) in props.tasks" :key="index">
                <TodoProjectListItem :task="task" />
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
