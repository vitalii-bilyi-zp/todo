import type { GetterTree } from "vuex";

import type { State } from "@/store/state";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Getters {}

export const getters: GetterTree<State, State> & Getters = {};
