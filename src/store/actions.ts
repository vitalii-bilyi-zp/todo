import type { ActionContext, ActionTree, CommitOptions } from "vuex";

import type { State } from "@/store/state";
import { type Mutations, MutationTypes } from "@/store/mutations";

import type { Project, Task } from "@/interfaces";

export enum ActionTypes {
    SET_PROJECT = "SET_PROJECT",
    SET_TASKS = "SET_TASKS",
    CREATE_TASK = "CREATE_TASK",
    UPDATE_TASK = "UPDATE_TASK",
    DELETE_TASK = "DELETE_TASK",
}

type AugmentedActionContext = {
    commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
        key: K,
        payload: P,
        options?: CommitOptions
    ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, "commit">;

export interface Actions {
    [ActionTypes.SET_PROJECT]({ commit }: AugmentedActionContext, payload: Project): void;
    [ActionTypes.SET_TASKS]({ commit }: AugmentedActionContext, payload: Task[]): void;
    [ActionTypes.CREATE_TASK]({ commit }: AugmentedActionContext, payload: Task): void;
    [ActionTypes.UPDATE_TASK]({ commit }: AugmentedActionContext, payload: Task): void;
    [ActionTypes.DELETE_TASK]({ commit }: AugmentedActionContext, payload: string): void;
}

export const actions: ActionTree<State, State> & Actions = {
    [ActionTypes.SET_PROJECT]({ commit }, payload: Project) {
        commit(MutationTypes.SET_PROJECT, payload);
    },

    [ActionTypes.SET_TASKS]({ commit }, payload: Task[]) {
        commit(MutationTypes.SET_TASKS, payload);
    },

    [ActionTypes.CREATE_TASK]({ commit }, payload: Task) {
        commit(MutationTypes.CREATE_TASK, payload);
    },

    [ActionTypes.UPDATE_TASK]({ commit }, payload: Task) {
        commit(MutationTypes.UPDATE_TASK, payload);
    },

    [ActionTypes.DELETE_TASK]({ commit }, payload: string) {
        commit(MutationTypes.DELETE_TASK, payload);
    },
};
