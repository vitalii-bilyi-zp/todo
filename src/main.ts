import { createApp } from "vue";
import App from "@/App.vue";

import "@/assets/scss/main.scss";
import clickOutside from "@/directives/click-outside";

const app = createApp(App);

app.directive("click-outside", clickOutside);

app.mount("#app");
