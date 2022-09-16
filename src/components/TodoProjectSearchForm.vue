<script setup lang="ts">
import { type Ref, ref } from "vue";

import { debounce } from "@/utils";

interface Emits {
    (e: "search", searchTerm: string | null): void;
}
const emit = defineEmits<Emits>();

const searchTerm: Ref<string | null> = ref(null);
const searchDebounced = debounce(() => {
    emit("search", searchTerm.value);
}, 500);
</script>

<template>
    <form class="search-form" @submit.prevent>
        <input v-model="searchTerm" class="input" type="text" placeholder="Type to search" @input="searchDebounced" />
    </form>
</template>

<style scoped lang="scss"></style>
