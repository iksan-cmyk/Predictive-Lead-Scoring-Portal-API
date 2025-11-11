const fs = require('fs');
const path = require('path');
const ort = require('onnxruntime-node');

let sessionPromise;
let usingFallbackPredictor = false;

const modelPath = path.join(__dirname, '../../model/model.onnx');

const createFallbackSession = () => ({
  inputNames: ['features'],
  outputNames: ['probabilities'],
  async run() {
    return {
      probabilities: {
        data: Float32Array.from([0.5]),
      },
    };
  },
});

const loadModel = async () => {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      await fs.promises.access(modelPath);
      console.log(`Loading ONNX model from ${modelPath}`);
      return ort.InferenceSession.create(modelPath);
    })().catch((error) => {
      usingFallbackPredictor = true;
      console.warn('Failed to load ONNX model:', error.message);
      console.warn('Using fallback predictor until a valid model is provided.');
      return createFallbackSession();
    });
  }

  return sessionPromise;
};

const warmupModel = async () => {
  await loadModel();
};

const normalizeFeatures = (features = []) => {
  if (!Array.isArray(features) || features.length === 0) {
    throw new Error('Features payload must be a non-empty numeric array.');
  }

  const numericFeatures = features.map((value) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      throw new Error('All feature values must be numeric.');
    }
    return numberValue;
  });

  return Float32Array.from(numericFeatures);
};

const fallbackProbability = (vector) => {
  const score = vector.reduce((acc, val) => acc + val, 0) / vector.length;
  const sigmoid = 1 / (1 + Math.exp(-score));
  return Number(sigmoid.toFixed(4));
};

const runInference = async (features = []) => {
  const vector = normalizeFeatures(features);
  const session = await loadModel();

  if (usingFallbackPredictor) {
    return {
      probability: fallbackProbability(vector),
      metadata: {
        fallback: true,
      },
    };
  }

  const tensor = new ort.Tensor('float32', vector, [1, vector.length]);
  const inputName = session.inputNames?.[0];

  if (!inputName) {
    throw new Error('Unable to determine ONNX model input name.');
  }

  const feeds = { [inputName]: tensor };

  const results = await session.run(feeds);
  const outputName = session.outputNames?.[0] || Object.keys(results)[0];

  if (!outputName) {
    throw new Error('Unable to determine ONNX model output name.');
  }

  const outputTensor = results[outputName];
  const probability = Number(outputTensor.data[0]);

  return {
    probability,
    metadata: {
      fallback: false,
    },
  };
};

module.exports = {
  warmupModel,
  runInference,
};
