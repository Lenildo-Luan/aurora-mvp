import { ref, computed } from "vue";
import { pipeline } from "@xenova/transformers";

export interface ClassificationResult {
  labels: string[];
  scores: number[];
  inferenceTime: number;
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
  const classifier = ref<any>(null);
  const isLoading = ref(false);
  const modelError = ref<string | null>(null);
  const isAnalyzing = ref(false);

  const modelStatus = computed(() => {
    if (modelError.value) return "error";
    if (!classifier.value) return "loading";
    return "ready";
  });

  const backendStatus = computed(() => {
    if (typeof navigator !== "undefined" && (navigator as any).gpu) {
      return "WebGPU";
    }
    return "WASM";
  });

  const initializeModel = async () => {
    if (classifier.value) {
      return;
    }

    isLoading.value = true;
    modelError.value = null;

    try {
      console.log("🎭 Loading Bertimbau Text Classifier");
      console.log("Loading model...");
      classifier.value = await pipeline(
        "text-classification",
        "lluanc/webai_test",
      );
      console.log("✓ Model loaded");
      console.log("✓ Model fully initialized");
    } catch (error: any) {
      console.error("Model initialization failed:", error);
      modelError.value = error.message || "Failed to load model";
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const analyzeText = async (text: string): Promise<ClassificationResult> => {
    if (!text.trim()) {
      throw new Error("Please enter some text");
    }

    if (!classifier.value) {
      throw new Error("Model not loaded yet. Please waiat...");
    }

    console.log("Analyzing text:", text);

    isAnalyzing.value = true;

    try {
      const startTime = performance.now();

      console.log("Running inference...");
      const result = await classifier.value(text, {
        top_k: null, // Get all scores
      });

      const endTime = performance.now();
      const inferenceTime = Math.round((endTime - startTime) * 100) / 100;

      console.log("Raw result:", result);

      // Build scores array in correct order for all 6 emotions
      const scores = new Array(6).fill(0);

      // Map results to correct indices
      if (Array.isArray(result)) {
        result.forEach((item: any) => {
          const labelIndex = EMOTION_LABELS.indexOf(item.label);
          if (labelIndex !== -1) {
            scores[labelIndex] = item.score;
          }
        });
      }

      console.log("Scores:", scores);

      return {
        labels: EMOTION_LABELS,
        scores,
        inferenceTime,
      };
    } catch (error: any) {
      console.error("Inference error:", error);
      throw error;
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
    classifier: computed(() => classifier.value),
  };
};
