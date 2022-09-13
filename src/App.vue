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
    background-color: #eff3f7;

    .project {
        width: 100%;
        max-width: 500px;
        margin: 2rem;
    }
}
</style>
