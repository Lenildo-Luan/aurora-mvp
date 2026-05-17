<script setup lang="ts">
import { ref, onMounted } from 'vue'

const textInput = ref('')
const results = ref<any>(null)
const showResults = ref(false)
const error = ref<string | null>(null)
const isLoading = ref(false)
const isAnalyzing = ref(false)
const modelStatus = ref('loading')
const backendStatus = ref('WASM')
const modelError = ref<string | null>(null)

const exampleTests = [
  { label: 'Happy', text: "This is the best day of my life! I'm so happy!" },
  { label: 'Upset', text: "I'm really upset about this situation." },
  { label: 'Neutral', text: 'This is neutral information.' },
]

const EMOTION_LABELS = ['Anger', 'Disgust', 'Fear', 'Joy', 'Sadness', 'Surprise']

let tokenizer: any = null
let model: any = null

const initializeModel = async () => {
  if (model && tokenizer) {
    return
  }

  isLoading.value = true
  modelError.value = null

  try {
    const { AutoTokenizer, AutoModel } = await import('@huggingface/transformers')
    
    console.log('🎭 Loading Bertimbau Text Classifier')
    console.log('Loading tokenizer...')
    tokenizer = await AutoTokenizer.from_pretrained('lluanc/webai_test')
    console.log('✓ Tokenizer loaded')
    
    console.log('Loading model...')
    model = await AutoModel.from_pretrained('lluanc/webai_test')
    console.log('✓ Model loaded')
    console.log('✓ Model fully initialized')
    
    modelStatus.value = 'ready'
  } catch (err: any) {
    console.error('Model initialization failed:', err)
    modelError.value = err.message || 'Failed to load model'
    modelStatus.value = 'error'
  } finally {
    isLoading.value = false
  }
}

const softmax = (arr: number[]): number[] => {
  return arr.map((x) => Math.max(0, x))
}

const analyzeText = async () => {
  error.value = null
  try {
    if (!textInput.value.trim()) {
      error.value = 'Please enter some text'
      return
    }

    if (!model || !tokenizer) {
      error.value = 'Model not loaded yet. Please wait...'
      return
    }

    isAnalyzing.value = true
    const startTime = performance.now()

    console.log('Tokenizing text...')
    const inputs = await tokenizer(textInput.value)
    console.log('Tokenized inputs:', inputs)

    console.log('Running inference...')
    const { logits } = await model(inputs)

    const endTime = performance.now()
    const inferenceTime = Math.round((endTime - startTime) * 100) / 100

    console.log('Raw logits:', logits)

    // Convert logits to array
    let logitsArray: number[]
    if (logits.data) {
      logitsArray = Array.from(logits.data)
    } else if (Array.isArray(logits)) {
      logitsArray = logits
    } else {
      throw new Error('Unexpected logits format')
    }

    console.log('Logits array:', logitsArray)
    const scores = softmax(logitsArray)
    console.log('Scores:', scores)

    results.value = {
      labels: EMOTION_LABELS,
      scores: scores.slice(0, 6),
      inferenceTime,
    }
    showResults.value = true
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
  } finally {
    isAnalyzing.value = false
  }
}

const handleExample = (text: string) => {
  textInput.value = text
  analyzeText()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ready':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-yellow-500'
  }
}

const getScorePercentage = (score: number) => {
  return Math.min(score * 100, 100)
}

onMounted(async () => {
  // Detect backend
  if (typeof navigator !== 'undefined' && (navigator as any).gpu) {
    backendStatus.value = 'WebGPU'
  }
  
  try {
    await initializeModel()
  } catch (err) {
    console.error('Failed to initialize model:', err)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
          🎭 Emotion Analyzer
        </h1>
        <p class="text-slate-400">
          Test Bertimbau emotion intensity with transformers.js
        </p>
      </header>

      <!-- Status Panel -->
      <div class="bg-slate-700 rounded-lg border border-slate-600 p-4 mb-8">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex justify-between items-center">
            <span class="text-slate-300 font-medium">Backend:</span>
            <span class="px-3 py-1 rounded text-sm font-medium" :class="getStatusColor(backendStatus)">
              {{ backendStatus }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-300 font-medium">Model:</span>
            <span
              class="px-3 py-1 rounded text-sm font-medium"
              :class="
                modelStatus === 'ready'
                  ? 'bg-green-500'
                  : modelStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              "
            >
              {{ modelStatus === 'ready' ? 'Ready' : modelStatus === 'loading' ? 'Loading...' : 'Error' }}
            </span>
          </div>
        </div>
        <div v-if="modelError" class="mt-3 p-2 bg-red-900 text-red-200 rounded text-sm">
          {{ modelError }}
        </div>
      </div>

      <!-- Input Section -->
      <div class="bg-slate-700 rounded-lg border border-slate-600 p-6 mb-8">
        <label for="text-input" class="block text-slate-300 font-medium mb-3">
          Enter text to analyze:
        </label>
        <textarea
          id="text-input"
          v-model="textInput"
          class="w-full h-24 bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          placeholder="Type some text to analyze emotion intensity..."
        />
        <button
          @click="analyzeText"
          :disabled="modelStatus !== 'ready' || isAnalyzing"
          class="mt-4 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
          :class="{ 'opacity-50 cursor-not-allowed': modelStatus !== 'ready' || isAnalyzing }"
        >
          <span v-if="isAnalyzing" class="inline-block">
            Analyzing...
          </span>
          <span v-else>
            Analyze
          </span>
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="bg-red-900 border border-red-700 rounded-lg p-4 mb-8 text-red-200">
        {{ error }}
      </div>

      <!-- Results Section -->
      <div v-if="showResults && results" class="bg-slate-700 rounded-lg border border-slate-600 p-6 mb-8">
        <h2 class="text-xl font-bold text-slate-100 mb-6">Results</h2>
        <div class="space-y-4">
          <div v-for="(label, index) in results.labels" :key="index" class="space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-300 font-medium">{{ label }}</span>
              <span class="text-slate-400 text-sm">{{ results.scores[index].toFixed(4) }}</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: getScorePercentage(results.scores[index]) / 2 + '%' }"
              />
            </div>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-600">
          <p class="text-slate-400 text-sm">
            <strong>Inference Time:</strong> {{ results.inferenceTime }}ms
          </p>
        </div>
      </div>

      <!-- Quick Examples -->
      <div class="bg-slate-700 rounded-lg border border-slate-600 p-6">
        <h3 class="text-lg font-bold text-slate-100 mb-4">Quick Examples</h3>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="example in exampleTests"
            :key="example.label"
            @click="handleExample(example.text)"
            :disabled="modelStatus !== 'ready' || isAnalyzing"
            class="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-100 font-medium rounded-lg transition-colors duration-200"
          >
            {{ example.label }}
          </button>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-12 text-center text-slate-500 text-sm">
        <p>
          Powered by Hugging Face Transformers.js | WebGPU with WASM fallback
        </p>
      </footer>
    </div>
  </div>
</template>
