import type { GetterTree } from "vuex";

import type { State } from "@/store/state";

import type { Task } from "@/interfaces";

export interface Getters {
    computedTasks(state: State): Task[];
}

export const getters: GetterTree<State, State> & Getters = {
    computedTasks: (state) => {
        // @todo update logic to handle subtasks
        return state.tasks;
    },
};
