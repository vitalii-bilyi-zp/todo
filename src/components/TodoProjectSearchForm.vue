<script setup lang="ts">
import { type Ref, ref } from "vue";

interface Props {
    searchHistory: string[];
}
const props = withDefaults(defineProps<Props>(), {
    searchHistory: () => [],
});

interface Emits {
    (e: "search", searchTerm: string): void;
}
const emit = defineEmits<Emits>();

const matches: Ref<string[]> = ref([]);
function updateMatches() {
    if (!searchTerm.value) {
        matches.value = [];
        return;
    }

    matches.value = props.searchHistory.filter(
        (item: string) =>
            item.toLowerCase() !== searchTerm.value.toLowerCase() &&
            item.toLowerCase().indexOf(searchTerm.value.toLowerCase()) >= 0
    );
}
function setSearchTerm(term: string) {
    searchTerm.value = term;
    search();
}

const searchTerm: Ref<string> = ref("");
function search() {
    emit("search", searchTerm.value);
    matches.value = [];
}

const dropdownState: Ref<boolean> = ref(false);
function setDropdownState(state: boolean) {
    dropdownState.value = state;
}
</script>

<template>
    <form class="search-form" @submit.prevent="search">
        <div
            class="dropdown"
            :class="{ 'is-active': dropdownState && matches.length }"
            v-click-outside="() => setDropdownState(false)"
        >
            <div class="dropdown-trigger">
                <input
                    v-model="searchTerm"
                    class="input"
                    :class="{ 'is-closable': searchTerm.length }"
                    type="text"
                    placeholder="Search..."
                    @input="updateMatches"
                    @focus="setDropdownState(true)"
                />
                <button type="button" class="button is-text reset-button" @click.stop.prevent="setSearchTerm('')">
                    <span class="icon">
                        <i class="mdi mdi-close-circle-outline"></i>
                    </span>
                </button>
                <button type="submit" class="button is-light search-button">
                    <span class="icon">
                        <i class="mdi mdi-magnify"></i>
                    </span>
                </button>
            </div>
            <div class="dropdown-menu" role="menu">
                <div class="dropdown-content">
                    <a v-for="(item, index) in matches" :key="index" class="dropdown-item" @click="setSearchTerm(item)">
                        {{ item }}
                    </a>
                </div>
            </div>
        </div>
    </form>
</template>

<style scoped lang="scss">
.search-form {
    .dropdown {
        width: 100%;

        .dropdown-trigger {
            position: relative;
            width: 100%;

            .input {
                padding-right: calc(3.25em - 1px);

                &.is-closable {
                    padding-right: calc(5.75em - 1px);

                    & + .reset-button {
                        display: flex;
                    }
                }
            }

            .reset-button {
                display: none;
                position: absolute;
                top: 1px;
                right: 2.5em;
                height: calc(2.5em - 2px);

                &:hover,
                &:active,
                &:focus {
                    background-color: transparent;
                }

                &:hover {
                    opacity: 0.8;
                }

                &:focus {
                    outline: none;
                    box-shadow: none;
                }
            }

            .search-button {
                position: absolute;
                top: 1px;
                right: 1px;
                border: 0;
                height: calc(2.5em - 2px);
                border-radius: 0 4px 4px 0;

                &:before {
                    display: block;
                    position: absolute;
                    content: "";
                    top: -1px;
                    bottom: -1px;
                    left: -1px;
                    right: -1px;
                }
            }
        }

        .dropdown-menu {
            width: 100%;
        }
    }
}
</style>
