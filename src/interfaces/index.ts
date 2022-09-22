export interface Project {
    id: string;
    name: string;
}

export interface Task {
    id: string;
    parentId?: string;
    name: string;
    isDone?: boolean;
    subtasks?: Task[];
    index: number;
}
