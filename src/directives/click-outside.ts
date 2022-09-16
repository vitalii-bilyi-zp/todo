import type { DirectiveBinding, ObjectDirective } from "vue";

interface ExtendedDirective extends ObjectDirective {
    handleClickOutside: (e: Event) => void;
}
type DirectiveCallback = (e: Event) => void;

const clickOutside = {
    mounted(el: HTMLElement, binding: DirectiveBinding<DirectiveCallback>) {
        const callback: DirectiveCallback = binding.value;
        const thisDirective = binding.dir as ExtendedDirective;

        thisDirective.handleClickOutside = (e: Event) => {
            const target = e.target as HTMLElement;
            if (!el.contains(target)) {
                callback(e);
            }
        };

        document.addEventListener("click", thisDirective.handleClickOutside);
    },
    beforeUnmount(element: HTMLElement, binding: DirectiveBinding<DirectiveCallback>) {
        const thisDirective = binding.dir as ExtendedDirective;
        document.removeEventListener("click", thisDirective.handleClickOutside);
    },
};

export default clickOutside;
