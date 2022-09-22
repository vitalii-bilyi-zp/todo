import type { Project, Task } from "@/interfaces";

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
    searchHistory: [],
};
