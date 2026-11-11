<template>
    <div
        class="min-h-screen flex flex-col bg-glb-50 text-slate-900 dark:bg-glb-950 dark:text-slate-100"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import "./tailwind.css";
</script>
