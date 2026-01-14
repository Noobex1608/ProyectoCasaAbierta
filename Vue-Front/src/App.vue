/**
 * Smart Classroom AI - Main App Component
 */
<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <Navbar />
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* Global styles handled by Tailwind CSS */
</style>
