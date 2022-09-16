import type { CommitOptions, DispatchOptions } from "vuex";
import { createStore, Store as VuexStore } from "vuex";

import { type State, state } from "@/store/state";
import { type Actions, actions } from "@/store/actions";
import { type Mutations, mutations } from "@/store/mutations";
import { type Getters, getters } from "@/store/getters";

export const store = createStore<State>({
    state,
    actions,
    mutations,
    getters,
});

export type Store<State> = Omit<VuexStore<State>, "commit" | "dispatch" | "getters"> & {
    commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
        key: K,
        payload: P,
        options?: CommitOptions
    ): ReturnType<Mutations[K]>;
} & {
    dispatch<K extends keyof Actions>(
        key: K,
        payload: Parameters<Actions[K]>[1],
        options?: DispatchOptions
    ): ReturnType<Actions[K]>;
} & {
    getters: {
        [K in keyof Getters]: ReturnType<Getters[K]>;
    };
};

export function useStore(): Store<State> {
    return store as Store<State>;
}
