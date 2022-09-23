import type { Project, Task } from "@/interfaces";

import { getSessionStorageObject } from "@/utils";

export interface State {
    projectId: string | null;
    project: Project | null;
    tasks: Task[];
    searchHistory: string[];
}

export const state: State = {
    projectId: sessionStorage.getItem("project-id"),
    project: null,
    tasks: [],
    searchHistory: getSessionStorageObject("search-history") || [],
};
