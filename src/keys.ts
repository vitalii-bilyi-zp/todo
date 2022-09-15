import type { InjectionKey, Ref } from "vue";

export const searchTermKey = Symbol() as InjectionKey<Ref<string | null>>;
