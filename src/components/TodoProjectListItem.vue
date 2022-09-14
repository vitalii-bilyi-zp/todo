<script setup lang="ts">
import type { Task } from "@/interfaces";

interface Props {
    task: Task;
}
const props = defineProps<Props>();
</script>

<template>
    <div class="todo-list-item">
        <p class="item-label">{{ props.task.name }}</p>
    </div>
</template>

<style scoped lang="scss">
.todo-list-item {
    padding: 15px 20px;
    margin: 6px 0px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e7eaef;
    box-shadow: 0px 1px 3px 0px rgb(5 10 23 / 7%);
}
</style>
