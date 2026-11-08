<template>
    <footer
        class="mt-8 border-t-2 border-slate-300 dark:border-glb-800 bg-white dark:bg-glb-950 text-xs font-mono text-slate-600 dark:text-slate-400"
    >
        <div
            class="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
            <p class="text-center sm:text-left leading-relaxed">
                <span class="font-bold text-slate-900 dark:text-slate-100">
                    glb
                </span>
                <span class="mx-1.5">—</span>
                <span>
                    Следење на најразлични нешта низ Македонија во реално време
                </span>
            </p>

            <div class="flex items-center gap-5 shrink-0 font-bold">
                <a
                    href="https://github.com/nkvtd/glb"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-glb-500 dark:hover:text-glb-400 transition-colors"
                >
                    <LogoGithub class="w-4 h-4 shrink-0" />
                    <span>glb</span>
                </a>

                <a
                    href="https://github.com/nkvtd/glb-watch"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-glb-500 dark:hover:text-glb-400 transition-colors"
                >
                    <LogoGithub class="w-4 h-4 shrink-0" />
                    <span>glb-watch</span>
                </a>

                <a
                    href="https://glb.nkvtd.com/api/reports"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-glb-600 dark:text-glb-400 hover:underline"
                >
                    REST API
                </a>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { LogoGithub } from "@vicons/ionicons5";
</script>