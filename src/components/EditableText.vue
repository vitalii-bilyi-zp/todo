<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";

interface Props {
    isEditing: boolean;
    modelValue: string;
    error?: string;
}
const props = defineProps<Props>();

interface Emits {
    (e: "update:modelValue", newValue: string | null): void;
    (e: "submit"): void;
    (e: "blur"): void;
}
const emit = defineEmits<Emits>();

function onInput(event: Event) {
    emit("update:modelValue", (event.target as HTMLInputElement).value);
}

function onSubmit(): void {
    emit("submit");
}

function onBlur(): void {
    emit("blur");
}

const input = ref<HTMLInputElement | null>(null);

watch(
    () => props.isEditing,
    async (newValue: boolean) => {
        if (!newValue) {
            return;
        }

        await nextTick();

        if (input.value) {
            input.value.focus();
        }
    }
);

onMounted(() => {
    if (props.isEditing && input.value) {
        input.value.focus();
    }
});
</script>

<template>
    <div class="editable-text" :class="{ 'is-editing': props.isEditing }">
        <div v-if="props.isEditing" class="field">
            <div class="control">
                <input
                    ref="input"
                    :value="props.modelValue"
                    class="input"
                    :class="{ 'is-danger': props.error }"
                    type="text"
                    @input="onInput"
                    @keyup.enter="onSubmit"
                    @blur="onBlur"
                />
            </div>
            <p v-if="props.error" class="help is-danger">{{ props.error }}</p>
        </div>
        <slot v-else>
            {{ props.modelValue }}
        </slot>
    </div>
</template>

<style scoped></style>
