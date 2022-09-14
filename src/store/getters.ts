import type { GetterTree } from "vuex";

import type { State } from "@/store/state";

export interface Getters {
    getCount(state: State): number;
}

export const getters: GetterTree<State, State> & Getters = {
    getCount: (state) => {
        return state.count;
    },
};
