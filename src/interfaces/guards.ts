import type { Project, Task } from ".";

export function isProject(object: any): object is Project {
    return "id" in object && "name" in object;
}

export function isTask(object: any): object is Task {
    return "id" in object && "name" in object && "order" in object;
}
