<script setup lang="ts">
interface Props {
    title: string;
}
const props = withDefaults(defineProps<Props>(), {
    title: "My Todo List",
});
</script>

<template>{{ props.title }}</template>

<style scoped></style>
