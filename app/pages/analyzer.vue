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
  showResults.value = false
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
    console.error('Analysis error:', err)
    error.value = err.message || 'An error occurred'
  } finally {
    isAnalyzing.value = false
  }
}

const handleExample = (text: string) => {
  textInput.value = text
  analyzeText()
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
  <UContainer class="py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">🎭 Emotion Analyzer</h1>
      <p class="text-muted">
        Test Bertimbau emotion intensity with @huggingface/transformers
      </p>
    </div>

    <!-- Status Panel -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Model Status</h2>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center justify-between">
          <span class="text-muted">Backend:</span>
          <UBadge
            :color="backendStatus === 'WebGPU' ? 'success' : 'info'"
            variant="soft"
          >
            {{ backendStatus }}
          </UBadge>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted">Model:</span>
          <UBadge
            :color="
              modelStatus === 'ready'
                ? 'success'
                : modelStatus === 'error'
                  ? 'error'
                  : 'warning'
            "
            variant="soft"
          >
            {{ modelStatus === 'ready' ? 'Ready' : modelStatus === 'loading' ? 'Loading...' : 'Error' }}
          </UBadge>
        </div>
      </div>

      <UAlert
        v-if="modelError"
        icon="i-lucide-alert-circle"
        color="error"
        title="Model Error"
        class="mt-4"
      >
        {{ modelError }}
      </UAlert>
    </UCard>

    <!-- Input Section -->
    <UCard class="mb-8">
      <template #header>
        <h2 class="text-lg font-semibold">Analyze Text</h2>
      </template>

      <div class="space-y-4">
        <UFormField label="Enter text to analyze">
          <UTextarea
            v-model="textInput"
            placeholder="Type some text to analyze emotion intensity..."
            :rows="6"
            :disabled="modelStatus !== 'ready'"
          />
        </UFormField>

        <UButton
          @click="analyzeText"
          :disabled="modelStatus !== 'ready' || isAnalyzing"
          :loading="isAnalyzing"
          color="primary"
          size="lg"
          block
        >
          {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
        </UButton>
      </div>
    </UCard>

    <!-- Error Display -->
    <UAlert
      v-if="error"
      icon="i-lucide-alert-circle"
      color="error"
      class="mb-8"
    >
      {{ error }}
    </UAlert>

    <!-- Results Section -->
    <UCard v-if="showResults && results" class="mb-8">
      <template #header>
        <h2 class="text-lg font-semibold">Analysis Results</h2>
      </template>

      <div class="space-y-6">
        <div v-for="(label, index) in results.labels" :key="index" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ label }}</span>
            <!-- <span class="text-muted text-sm">{{ results.scores[index].toFixed(4) }}</span> -->
          </div>
          <UProgress
            :modelValue="results.scores[index] * 50"
            color="primary"
          />
        </div>
      </div>

      <USeparator class="my-6" />

      <p class="text-muted text-sm">
        <strong>Inference Time:</strong> {{ results.inferenceTime }}ms
      </p>
    </UCard>

    <!-- Quick Examples -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Quick Examples</h2>
      </template>

      <div class="grid grid-cols-3 gap-3">
        <UButton
          v-for="example in exampleTests"
          :key="example.label"
          @click="handleExample(example.text)"
          :disabled="modelStatus !== 'ready' || isAnalyzing"
          variant="outline"
          color="neutral"
          block
        >
          {{ example.label }}
        </UButton>
      </div>
    </UCard>

    <!-- Footer -->
    <footer class="mt-12 text-center text-muted text-sm">
      <p>
        Powered by Hugging Face Transformers | WebGPU with WASM fallback
      </p>
    </footer>
  </UContainer>
</template>
