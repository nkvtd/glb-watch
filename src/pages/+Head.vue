<template>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" :href="logoUrl" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
        href="https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&family=Ubuntu:wght@400;500;700&display=swap"
        rel="stylesheet"
    />
    <script
        innerHTML="(function(){try{var t=localStorage.getItem('glb-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()"
    ></script>
</template>

<script setup lang="ts">
import logoUrl from "../../assets/logo.svg";
</script>