<template>
    <div
        class="min-h-screen flex flex-col justify-between bg-slate-100 dark:bg-glb-950 text-slate-900 dark:text-slate-100"
    >
        <header
            class="bg-white dark:bg-glb-950 border-b-2 border-slate-300 dark:border-glb-800"
        >
            <div
                class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between"
            >
                <button
                    type="button"
                    class="flex items-center gap-3 cursor-pointer"
                    @click="goHome"
                >
                    <img :src="logoTextUrl" alt="glb" class="h-7 w-auto" />
                    <span
                        class="px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-widest bg-glb-500 text-white"
                    >
                        WATCH
                    </span>
                </button>

                <button
                    type="button"
                    aria-label="Промени тема"
                    class="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-700 hover:border-glb-500 cursor-pointer"
                    @click="toggleTheme"
                >
                    <SunnyOutline v-if="isDark" class="w-4 h-4 text-amber-400" />
                    <MoonOutline v-else class="w-4 h-4 text-slate-800" />
                </button>
            </div>
        </header>

        <main class="max-w-md w-full mx-auto px-4 py-16">
            <div
                class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 border-t-4"
                :class="is404 ? 'border-t-amber-300' : 'border-t-red-600'"
            >
                <div
                    class="px-4 py-3 border-b border-slate-200 dark:border-glb-800 flex items-center justify-between font-mono text-xs"
                >
                    <span class="uppercase font-bold text-slate-500">
                        Грешка
                    </span>
                    <span
                        class="px-2 py-0.5 font-bold"
                        :class="
                            is404
                                ? 'bg-amber-300 text-slate-950'
                                : 'bg-red-600 text-white'
                        "
                    >
                        {{ is404 ? "404" : "500" }}
                    </span>
                </div>

                <div class="p-5 space-y-4">
                    <h1 class="text-lg font-bold">
                        {{
                            is404
                                ? "Страницата не постои"
                                : "Настана грешка при вчитување"
                        }}
                    </h1>

                    <p
                        class="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed"
                    >
                        {{
                            is404
                                ? "Страницата што ја барате не е пронајдена."
                                : "Серверот моментално не може да го обработи барањето."
                        }}
                    </p>

                    <button
                        type="button"
                        class="w-full py-2.5 px-4 bg-glb-500 hover:bg-glb-600 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        @click="goHome"
                    >
                        <ArrowBackOutline class="w-4 h-4" />
                        <span>Назад на почетна</span>
                    </button>
                </div>
            </div>
        </main>

        <AppFooter />
    </div>
</template>

<script setup lang="ts">
import { ArrowBackOutline, MoonOutline, SunnyOutline } from "@vicons/ionicons5";
import { usePageContext } from "vike-vue/usePageContext";
import { computed } from "vue";
import logoTextUrl from "../../../assets/logo_text.svg";
import AppFooter from "../../components/AppFooter.vue";
import { useTheme } from "../../composables/useTheme";

const pageContext = usePageContext();
const { isDark, toggleTheme } = useTheme();

const is404 = computed(
  () => pageContext.is404 || pageContext.abortStatusCode === 404,
);

function goHome() {
  window.location.assign("/");
}
</script>