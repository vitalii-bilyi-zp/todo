<script setup lang="ts">
import TodoProject from "@/components/TodoProject.vue";
</script>

<template>
    <div class="todo-app">
        <TodoProject class="project" />
    </div>
</template>

<style scoped lang="scss">
.todo-app {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;

    .project {
        width: 100%;
        max-width: 540px;
        padding: 20px;
    }
}
</style>
