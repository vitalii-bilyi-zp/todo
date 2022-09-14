import type { Project, Task } from "@/interfaces";

import { getSessionStorageObject } from "@/utils";

export interface State {
    project: Project;
    tasks: Task[];
}

export const state: State = {
    project: getSessionStorageObject("project"),
    tasks: getSessionStorageObject("tasks") || [],
};
