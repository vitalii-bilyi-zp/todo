import { type Ref, ref, onMounted, onUnmounted } from "vue";

export interface Draggable {
    dragResponse: Ref<{
        prevId: string;
        nextId: string;
    }>;
    addDraggableElement: (id: string) => void;
}

export function useDraggable(root?: HTMLElement | null): Draggable {
    let prevId = "";
    let nextId = "";
    const dragResponse = ref({
        prevId: "",
        nextId: "",
    });
    const parent = root || document;
    let draggableElements: HTMLElement[] = [];

    onMounted(() => {
        draggableElements = Array.prototype.slice.call(parent.querySelectorAll<HTMLElement>('[draggable="true"]'));
        draggableElements.forEach(setupEventHandlers);
    });

    onUnmounted(() => {
        draggableElements.forEach(resetEventHandlers);
    });

    function addDraggableElement(id: string) {
        const element: HTMLElement | null = parent.querySelector(`[data-id="${id}"]`);
        if (!element) {
            return;
        }

        draggableElements.push(element);
        setupEventHandlers(element);
    }

    function setupEventHandlers(element: HTMLElement) {
        element.addEventListener("dragstart", handleDragStart);
        // element.addEventListener("dragenter", handleDragEnter);
        element.addEventListener("dragover", handleDragOver);
        element.addEventListener("dragleave", handleDragLeave);
        element.addEventListener("drop", handleDrop);
        element.addEventListener("dragend", handleDragEnd);
    }

    function resetEventHandlers(element: HTMLElement) {
        element.removeEventListener("dragstart", handleDragStart);
        // element.removeEventListener("dragenter", handleDragEnter);
        element.removeEventListener("dragover", handleDragOver);
        element.removeEventListener("dragleave", handleDragLeave);
        element.removeEventListener("drop", handleDrop);
        element.removeEventListener("dragend", handleDragEnd);
    }

    function handleDragStart(event: DragEvent) {
        const target = event.target as HTMLElement;
        prevId = target.dataset.id || "";
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();

        const target = event.target as HTMLElement;
        const dragElement = target.closest('[draggable="true"]') as HTMLElement;
        const parentElement: HTMLElement | null = dragElement.closest(`[data-id="${prevId}"]`);

        if (parentElement) {
            return;
        }

        nextId = dragElement.dataset.id || "";
        dragElement.classList.add("over");
    }

    // function handleDragEnter(event: DragEvent) {
    //     const target = event.target as HTMLElement;
    //     const dragElement = target.closest('[draggable="true"]') as HTMLElement;
    //     dragElement.classList.add("over");
    // }

    function handleDragLeave(event: DragEvent) {
        const target = event.target as HTMLElement;
        const dragElement = target.closest('[draggable="true"]') as HTMLElement;
        dragElement.classList.remove("over");
    }

    function handleDrop(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();

        const target = event.target as HTMLElement;
        const dragElement = target.closest('[draggable="true"]') as HTMLElement;
        const parentElement: HTMLElement | null = dragElement.closest(`[data-id="${prevId}"]`);

        if (parentElement) {
            return;
        }

        nextId = dragElement.dataset.id || "";
        dragResponse.value = {
            prevId,
            nextId,
        };
    }

    function handleDragEnd() {
        prevId = "";
        nextId = "";
        draggableElements.forEach((element: HTMLElement) => {
            element.classList.remove("over");
        });
    }

    return { dragResponse, addDraggableElement };
}
