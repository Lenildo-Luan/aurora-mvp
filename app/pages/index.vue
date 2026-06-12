<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UContainer class="max-w-md text-center py-12">
      <h1 class="text-5xl font-bold mb-4">🌟 Aurora AI</h1>
      <p class="text-muted mb-8 text-lg">
        Test state-of-the-art AI models in your browser
      </p>

      <div class="space-y-4">
        <UButton
          to="/analyzer"
          color="primary"
          size="lg"
          block
          class="text-base"
        >
          🎭 Emotion Analyzer
        </UButton>
      </div>

      <footer class="mt-16 text-muted text-sm">
        <p>
          Powered by Hugging Face Transformers | WebGPU with WASM fallback
        </p>
      </footer>
    </UContainer>
  </div>
</template>
