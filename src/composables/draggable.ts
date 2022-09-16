import { type Ref, ref, onMounted, onUnmounted } from "vue";

export interface Draggable {
    dragResponse: Ref<{
        prevId: string;
        nextId: string;
    }>;
}

export function useDraggable(root?: HTMLElement | null): Draggable {
    let prevId = "";
    let nextId = "";
    const dragResponse = ref({
        prevId: "",
        nextId: "",
    });
    const parent = root || document;
    let draggableElements: NodeList | null = null;

    onMounted(() => {
        draggableElements = parent.querySelectorAll('[draggable="true"]');
        [].forEach.call(draggableElements, (element: HTMLElement) => {
            element.addEventListener("dragstart", handleDragStart);
            // element.addEventListener("dragenter", handleDragEnter);
            element.addEventListener("dragover", handleDragOver);
            element.addEventListener("dragleave", handleDragLeave);
            element.addEventListener("drop", handleDrop);
            element.addEventListener("dragend", handleDragEnd);
        });
    });

    onUnmounted(() => {
        if (draggableElements) {
            [].forEach.call(draggableElements, (element: HTMLElement) => {
                element.removeEventListener("dragstart", handleDragStart);
                // element.removeEventListener("dragenter", handleDragEnter);
                element.removeEventListener("dragover", handleDragOver);
                element.removeEventListener("dragleave", handleDragLeave);
                element.removeEventListener("drop", handleDrop);
                element.removeEventListener("dragend", handleDragEnd);
            });
        }
    });

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
        [].forEach.call(draggableElements, (element: HTMLElement) => {
            element.classList.remove("over");
        });
    }

    return { dragResponse };
}
