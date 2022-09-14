import type { MutationTree } from "vuex";
import type { State } from "@/store/state";

export enum MutationTypes {
    SET_COUNT = "SET_COUNT",
}

export interface Mutations {
    [MutationTypes.SET_COUNT](state: State, count: number): void;
}

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.SET_COUNT](state: State, count: number) {
        state.count = count;
    },
};
