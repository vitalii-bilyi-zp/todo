// @ts-ignore
import Sortable from "sortablejs";

import { type Ref, ref } from "vue";

interface SortableEvent {
    item: HTMLElement; // dragged HTMLElement
    to: HTMLElement; // target list
    from: HTMLElement; // previous list
    oldIndex: number; // element's old index within old parent
    newIndex: number; // element's new index within new parent
    oldDraggableIndex: number; // element's old index within old parent, only counting draggable elements
    newDraggableIndex: number; // element's new index within new parent, only counting draggable elements
    clone: HTMLElement; // the clone element
}

export interface SortResponse {
    itemId: string;
    oldParentId: string;
    newParentId: string;
    oldIndex: number;
    newIndex: number;
}

export interface SortableList {
    sortResponse: Ref<SortResponse>;
    initSortableList: (root?: HTMLElement | null) => void;
}

export function useSortableList(): SortableList {
    const sortResponse = ref({
        itemId: "",
        oldParentId: "",
        newParentId: "",
        oldIndex: -1,
        newIndex: -1,
    });

    function initSortableList(root?: HTMLElement | null): void {
        const parent = root || document;
        const nestedSortables = parent.querySelectorAll<HTMLElement>(".todo-list");

        for (let i = 0; i < nestedSortables.length; i++) {
            new Sortable(nestedSortables[i], {
                group: "nested",
                animation: 150,
                fallbackOnBody: true,
                swapThreshold: 0.65,
                draggable: ".is-draggable",
                onEnd: onDragEnd,
            });
        }
    }

    function onDragEnd(event: SortableEvent): void {
        const itemId = event.item.dataset.id || "";
        const oldParentId = event.from.dataset.parentId || "";
        const newParentId = event.to.dataset.parentId || "";

        if (event.oldIndex === event.newIndex && oldParentId === newParentId) {
            return;
        }

        sortResponse.value = {
            itemId,
            oldParentId,
            newParentId,
            oldIndex: event.oldIndex,
            newIndex: event.newIndex,
        };
    }

    return { sortResponse, initSortableList };
}
