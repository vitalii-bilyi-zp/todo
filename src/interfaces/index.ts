export interface Project {
    id: string | number;
    name: string;
}

export interface Task {
    id: string | number;
    parentId?: string | number;
    name: string;
    isDone?: boolean;
    subtasks?: Task[];
}
