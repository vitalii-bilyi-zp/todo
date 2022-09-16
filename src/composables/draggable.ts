import { type Ref, ref, onMounted, onUnmounted } from "vue";

export interface Draggable {
    currentElement: Ref<HTMLElement | null>;
    newElement: Ref<HTMLElement | null>;
}

export function useDraggable(root?: HTMLElement | null): Draggable {
    const currentElement: Ref<HTMLElement | null> = ref(null);
    const newElement: Ref<HTMLElement | null> = ref(null);
    let draggableElements: NodeList | null = null;

    onMounted(() => {
        const parent = root || document;
        draggableElements = parent.querySelectorAll('[draggable="true"]');
        [].forEach.call(draggableElements, (element: HTMLElement) => {
            element.addEventListener("dragstart", handleDragStart);
            element.addEventListener("dragenter", handleDragEnter);
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
                element.removeEventListener("dragenter", handleDragEnter);
                element.removeEventListener("dragover", handleDragOver);
                element.removeEventListener("dragleave", handleDragLeave);
                element.removeEventListener("drop", handleDrop);
                element.removeEventListener("dragend", handleDragEnd);
            });
        }
    });

    function handleDragStart(event: DragEvent) {
        const target = event.target as HTMLElement;
        event.dataTransfer?.setData("text/plain", target.dataset.id || "");
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    function handleDragEnter(event: DragEvent) {
        // event.target.classList.add("over");
    }

    function handleDragLeave(event: DragEvent) {
        // event.target.classList.remove("over");
    }

    function handleDrop(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();

        const currentElementId = event.dataTransfer?.getData("text");
        currentElement.value = document.querySelector(`[data-id="${currentElementId}"]`);
        const target = event.target as HTMLElement;
        newElement.value = target.closest('[draggable="true"]');
    }

    function handleDragEnd(event: DragEvent) {
        event.dataTransfer?.clearData();
    }

    return { currentElement, newElement };
}
