import { ref, computed, type Ref } from "vue";
import type { PreTrainedTokenizer, Tensor } from "@huggingface/transformers";

export interface ClassificationResult {
  labels: string[];
  scores: number[];
  inferenceTime: number;
}

interface HuggingFaceModel {
  (inputs: Record<string, unknown>): Promise<{ logits: Tensor }>;
}

const EMOTION_LABELS = [
  "Anger",
  "Disgust",
  "Fear",
  "Joy",
  "Sadness",
  "Surprise",
];

export const useTextClassifier = () => {
  const tokenizer: Ref<PreTrainedTokenizer | null> = ref(null);
  const model: Ref<HuggingFaceModel | null> = ref(null);
  const isLoading = ref(false);
  const modelError = ref<string | null>(null);
  const isAnalyzing = ref(false);

  const modelStatus = computed(() => {
    if (modelError.value) return "error";
    if (!model.value || !tokenizer.value) return "loading";
    return "ready";
  });

  const backendStatus = computed(() => {
    if (typeof navigator !== "undefined" && "gpu" in navigator) {
      return "WebGPU";
    }
    return "WASM";
  });

  const initializeModel = async () => {
    if (model.value && tokenizer.value) {
      return;
    }

    isLoading.value = true;
    modelError.value = null;

    try {
      // Dynamic import - only loads in browser
      const { AutoTokenizer, AutoModel } =
        await import("@huggingface/transformers");

      console.log("🎭 Loading Bertimbau Text Classifier");
      console.log("Loading tokenizer...");
      tokenizer.value =
        await AutoTokenizer.from_pretrained("lluanc/webai_test");
      console.log("✓ Tokenizer loaded");

      console.log("Loading model...");
      model.value = await AutoModel.from_pretrained("lluanc/webai_test");
      console.log("✓ Model loaded");
      console.log("✓ Model fully initialized");
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Model initialization failed:", error);
      modelError.value = errorMessage || "Failed to load model";
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const softmax = (arr: number[]): number[] => {
    return arr.map((x) => Math.max(0, x));
  };

  const analyzeText = async (text: string): Promise<ClassificationResult> => {
    if (!text.trim()) {
      throw new Error("Please enter some text");
    }

    if (!tokenizer.value || !model.value) {
      throw new Error("Model not loaded yet. Please wait...");
    }

    isAnalyzing.value = true;

    try {
      const startTime = performance.now();

      console.log("Tokenizing text...");
      const inputs = tokenizer.value(text);
      console.log("Tokenized inputs:", inputs);

      console.log("Running inference...");
      const { logits } = await model.value(inputs);

      const endTime = performance.now();
      const inferenceTime = Math.round((endTime - startTime) * 100) / 100;

      console.log("Raw logits:", logits);

      let logitsArray: number[];
      if (logits.data) {
        logitsArray = Array.from(logits.data);
      } else if (Array.isArray(logits)) {
        logitsArray = logits;
      } else {
        throw new Error("Unexpected logits format");
      }

      console.log("Logits array:", logitsArray);
      const scores = softmax(logitsArray);
      console.log("Scores:", scores);

      return {
        labels: EMOTION_LABELS,
        scores: scores.slice(0, 6),
        inferenceTime,
      };
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Inference error:", error);
      throw new Error(errorMessage || "An error occurred during inference");
    } finally {
      isAnalyzing.value = false;
    }
  };

  return {
    initializeModel,
    analyzeText,
    isLoading,
    isAnalyzing,
    modelStatus,
    backendStatus,
    modelError,
    model: computed(() => model.value),
    tokenizer: computed(() => tokenizer.value),
  };
};
