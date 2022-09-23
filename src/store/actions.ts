import type { ActionContext, ActionTree, CommitOptions } from "vuex";

import type { State } from "@/store/state";
import { type Mutations, MutationTypes } from "@/store/mutations";

import type { CreateProjectDto, UpdateProjectDto, Project, CreateTaskDto, UpdateTaskDto, Task } from "@/interfaces";

export enum ActionTypes {
    GET_PROJECT = "GET_PROJECT",
    CREATE_PROJECT = "CREATE_PROJECT",
    UPDATE_PROJECT = "UPDATE_PROJECT",
    DELETE_PROJECT = "DELETE_PROJECT",
    EXPORT_PROJECT = "EXPORT_PROJECT",
    IMPORT_PROJECT = "IMPORT_PROJECT",
    GET_TASKS = "GET_TASKS",
    CREATE_TASK = "CREATE_TASK",
    UPDATE_TASKS = "UPDATE_TASKS",
    DELETE_TASK = "DELETE_TASK",
    SET_SEARCH_HISTORY = "SET_SEARCH_HISTORY",
}

type AugmentedActionContext = {
    commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
        key: K,
        payload: P,
        options?: CommitOptions
    ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, "commit">;

export interface Actions {
    [ActionTypes.CREATE_PROJECT]({ commit }: AugmentedActionContext, payload: CreateProjectDto): Promise<Project>;

    [ActionTypes.GET_PROJECT]({ commit }: AugmentedActionContext, id: string): Promise<Project>;

    [ActionTypes.UPDATE_PROJECT]({ commit }: AugmentedActionContext, payload: UpdateProjectDto): Promise<Project>;

    [ActionTypes.DELETE_PROJECT]({ commit }: AugmentedActionContext, id: string): Promise<Project>;

    [ActionTypes.EXPORT_PROJECT]({ commit }: AugmentedActionContext, id: string): Promise<Response>;

    [ActionTypes.IMPORT_PROJECT](
        { commit }: AugmentedActionContext,
        payload: { id: string; file: File }
    ): Promise<Project>;

    [ActionTypes.CREATE_TASK]({ commit }: AugmentedActionContext, payload: CreateTaskDto): Promise<Task>;

    [ActionTypes.UPDATE_TASKS]({ commit }: AugmentedActionContext, payload: UpdateTaskDto[]): Promise<Task[]>;

    [ActionTypes.DELETE_TASK]({ commit }: AugmentedActionContext, id: string): Promise<Task>;

    [ActionTypes.SET_SEARCH_HISTORY]({ commit }: AugmentedActionContext, payload: string[]): void;
}

export const actions: ActionTree<State, State> & Actions = {
    async [ActionTypes.CREATE_PROJECT]({ commit }, payload: CreateProjectDto) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const project: Project = await res.json();
        commit(MutationTypes.SET_PROJECT_ID, project._id);
        commit(MutationTypes.SET_PROJECT, project);

        return project;
    },

    async [ActionTypes.GET_PROJECT]({ commit }, id: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const project: Project = await res.json();
        commit(MutationTypes.SET_PROJECT, project);
        commit(MutationTypes.SET_TASKS, project.tasks || []);

        return project;
    },

    async [ActionTypes.UPDATE_PROJECT]({ commit }, payload: UpdateProjectDto) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${payload._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const project: Project = await res.json();
        commit(MutationTypes.SET_PROJECT, project);

        return project;
    },

    async [ActionTypes.DELETE_PROJECT]({ commit }, id: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const project: Project = await res.json();
        commit(MutationTypes.SET_PROJECT_ID, null);
        commit(MutationTypes.SET_PROJECT, null);
        commit(MutationTypes.SET_TASKS, []);

        return project;
    },

    async [ActionTypes.EXPORT_PROJECT](ctx, id: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}/export`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return res;
    },

    async [ActionTypes.IMPORT_PROJECT]({ commit }, { id, file }: { id: string; file: File }) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}/import`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const project: Project = await res.json();
        commit(MutationTypes.SET_PROJECT, project);
        commit(MutationTypes.SET_TASKS, project.tasks || []);

        return project;
    },

    async [ActionTypes.CREATE_TASK](ctx, payload: CreateTaskDto) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const task: Task = await res.json();
        return task;
    },

    async [ActionTypes.UPDATE_TASKS](ctx, payload: UpdateTaskDto[]) {
        if (!payload.length) {
            return [];
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const tasks: Task[] = await res.json();
        return tasks;
    },

    async [ActionTypes.DELETE_TASK](ctx, id: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const task: Task = await res.json();
        return task;
    },

    [ActionTypes.SET_SEARCH_HISTORY]({ commit }, payload: string[]) {
        commit(MutationTypes.SET_SEARCH_HISTORY, payload);
    },
};
