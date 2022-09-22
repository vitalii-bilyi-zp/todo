import type { MutationTree } from "vuex";
import type { State } from "@/store/state";

import type { Project, Task } from "@/interfaces";

export enum MutationTypes {
    SET_PROJECT_ID = "SET_PROJECT_ID",
    SET_PROJECT = "SET_PROJECT",
    SET_TASKS = "SET_TASKS",
}

export interface Mutations {
    [MutationTypes.SET_PROJECT_ID](state: State, payload: string | null): void;
    [MutationTypes.SET_PROJECT](state: State, payload: Project | null): void;
    [MutationTypes.SET_TASKS](state: State, payload: Task[]): void;
}

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.SET_PROJECT_ID](state: State, payload: string | null) {
        state.projectId = payload;
        payload ? sessionStorage.setItem("project-id", payload) : sessionStorage.removeItem("project-id");
    },

    [MutationTypes.SET_PROJECT](state: State, payload: Project | null) {
        state.project = payload;
    },

    [MutationTypes.SET_TASKS](state: State, payload: Task[]) {
        state.tasks = payload;
    },
};
