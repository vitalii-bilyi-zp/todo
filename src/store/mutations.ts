import type { MutationTree } from "vuex";
import type { State } from "@/store/state";

import type { Project, Task } from "@/interfaces";

import { setSessionStorageObject } from "@/utils";

export enum MutationTypes {
    SET_PROJECT = "SET_PROJECT",
    SET_TASKS = "SET_TASKS",
    CREATE_TASK = "CREATE_TASK",
    UPDATE_TASK = "UPDATE_TASK",
    DELETE_TASK = "DELETE_TASK",
    SET_SEARCH_HISTORY = "SET_SEARCH_HISTORY",
}

export interface Mutations {
    [MutationTypes.SET_PROJECT](state: State, payload: Project): void;
    [MutationTypes.SET_TASKS](state: State, payload: Task[]): void;
    [MutationTypes.CREATE_TASK](state: State, payload: Task): void;
    [MutationTypes.UPDATE_TASK](state: State, payload: Task): void;
    [MutationTypes.DELETE_TASK](state: State, payload: string): void;
    [MutationTypes.SET_SEARCH_HISTORY](state: State, payload: string[]): void;
}

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.SET_PROJECT](state: State, payload: Project) {
        state.project = payload;
        setSessionStorageObject("project", payload);
    },

    [MutationTypes.SET_TASKS](state: State, payload: Task[]) {
        state.tasks = payload;
        setSessionStorageObject("tasks", payload);
    },

    [MutationTypes.CREATE_TASK](state: State, payload: Task) {
        state.tasks.push(payload);
        setSessionStorageObject("tasks", state.tasks);
    },

    [MutationTypes.UPDATE_TASK](state: State, payload: Task) {
        const taskIndex: number = state.tasks.findIndex((item) => item.id === payload.id);
        if (taskIndex === -1) {
            return;
        }

        state.tasks[taskIndex] = payload;
        setSessionStorageObject("tasks", state.tasks);
    },

    [MutationTypes.DELETE_TASK](state: State, payload: string) {
        const taskIndex: number = state.tasks.findIndex((item) => item.id === payload);
        if (taskIndex === -1) {
            return;
        }

        state.tasks.splice(taskIndex, 1);
        setSessionStorageObject("tasks", state.tasks);
    },

    [MutationTypes.SET_SEARCH_HISTORY](state: State, payload: string[]) {
        state.searchHistory = payload;
        setSessionStorageObject("search-history", payload);
    },
};
