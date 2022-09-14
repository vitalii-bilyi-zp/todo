import type { ActionContext, ActionTree, CommitOptions } from "vuex";

import type { State } from "@/store/state";
import type { Mutations } from "@/store/mutations";
import { MutationTypes } from "@/store/mutations";

export enum ActionTypes {
    SET_COUNT = "SET_COUNT",
}

type AugmentedActionContext = {
    commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
        key: K,
        payload: P,
        options?: CommitOptions
    ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, "commit">;

export interface Actions {
    [ActionTypes.SET_COUNT]({ commit }: AugmentedActionContext, count: number): void;
}

export const actions: ActionTree<State, State> & Actions = {
    [ActionTypes.SET_COUNT]({ commit }, count: number) {
        commit(MutationTypes.SET_COUNT, count);
    },
};
