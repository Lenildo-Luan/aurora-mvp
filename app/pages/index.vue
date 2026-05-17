<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">
        Aurora AI
      </h1>
      <p class="text-slate-400 mb-8 text-lg">
        Test state-of-the-art AI models in your browser
      </p>

      <div class="space-y-4">
        <NuxtLink
          to="/analyzer"
          class="block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          🎭 Emotion Analyzer
        </NuxtLink>
      </div>

      <footer class="mt-16 text-slate-500 text-sm">
        <p>
          Powered by Hugging Face Transformers.js | WebGPU with WASM fallback
        </p>
      </footer>
    </div>
  </div>
</template>
