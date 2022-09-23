export interface CreateProjectDto {
    name: string;
}

export interface UpdateProjectDto {
    _id: string;
    name?: string;
}

export interface Project {
    _id: string;
    name: string;
    tasks?: Task[];
}

export interface CreateTaskDto {
    parentId: string;
    name: string;
    index: number;
}

export interface UpdateTaskDto {
    _id: string;
    parentId?: string;
    name?: string;
    index?: number;
    isDone?: boolean;
}

export interface Task {
    _id: string;
    parentId: string;
    name: string;
    index: number;
    isDone?: boolean;
    subtasks?: Task[];
}

export interface TaskWithNeighbours {
    task: Task;
    neighbours: Task[];
}
