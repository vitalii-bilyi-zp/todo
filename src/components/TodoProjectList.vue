<script setup lang="ts">
import TodoProjectListItem from "@/components/TodoProjectListItem.vue";

interface Props {
    items: string[];
}
const props = withDefaults(defineProps<Props>(), {
    items: () => [],
});
</script>

<template>
    <div class="menu">
        <ul class="menu-list">
            <li v-for="(item, index) in props.items" :key="index">
                <TodoProjectListItem :label="item" />
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
