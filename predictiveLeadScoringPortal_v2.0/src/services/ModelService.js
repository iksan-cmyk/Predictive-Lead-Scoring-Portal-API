const ort = require('onnxruntime-node');
const path = require('path');
const fs = require('fs');
const autoBind = require('../utils/autoBind');
const config = require('../config/environment');

class ModelService {
  constructor() {
    this.model = null;
    this.modelPath = path.isAbsolute(config.model.path) 
      ? config.model.path 
      : path.join(__dirname, '..', config.model.path);
    this.modelVersion = config.model.featureSchemaVersion;
    autoBind(this);
  }

  async loadModel() {
    if (this.model) {
      return this.model;
    }

    if (!fs.existsSync(this.modelPath)) {
      throw new Error(`Model file not found at ${this.modelPath}`);
    }

    try {
      this.model = await ort.InferenceSession.create(this.modelPath);
      console.log('Model loaded successfully');
      return this.model;
    } catch (error) {
      throw new Error(`Failed to load model: ${error.message}`);
    }
  }

  /**
   * Prepare feature vector from lead data
   * This should match the expected input format of your trained model
   */
  prepareFeatureVector(lead) {
    // Feature engineering based on lead data
    // Adjust this based on your actual model's expected input format
    const features = [
      lead.age || 0,
      lead.job ? this.encodeJob(lead.job) : 0,
      lead.marital ? this.encodeMarital(lead.marital) : 0,
      lead.education ? this.encodeEducation(lead.education) : 0,
      lead.default_credit ? 1 : 0,
      parseFloat(lead.balance) || 0,
      lead.housing_loan ? 1 : 0,
      lead.personal_loan ? 1 : 0,
      lead.contact_type ? this.encodeContactType(lead.contact_type) : 0,
      lead.day_of_month || 0,
      lead.month ? this.encodeMonth(lead.month) : 0,
      lead.duration || 0,
      lead.campaign || 0,
      lead.pdays || 0,
      lead.previous || 0,
      lead.poutcome ? this.encodePoutcome(lead.poutcome) : 0,
    ];

    return features;
  }

  // Encoding functions - adjust based on your model's training data
  encodeJob(job) {
    const jobMap = {
      'admin.': 0, 'blue-collar': 1, 'entrepreneur': 2, 'housemaid': 3,
      'management': 4, 'retired': 5, 'self-employed': 6, 'services': 7,
      'student': 8, 'technician': 9, 'unemployed': 10, 'unknown': 11
    };
    return jobMap[job.toLowerCase()] || 11;
  }

  encodeMarital(marital) {
    const maritalMap = { 'divorced': 0, 'married': 1, 'single': 2, 'unknown': 3 };
    return maritalMap[marital.toLowerCase()] || 3;
  }

  encodeEducation(education) {
    const eduMap = {
      'basic.4y': 0, 'basic.6y': 1, 'basic.9y': 2, 'high.school': 3,
      'illiterate': 4, 'professional.course': 5, 'university.degree': 6, 'unknown': 7
    };
    return eduMap[education.toLowerCase()] || 7;
  }

  encodeContactType(contact) {
    const contactMap = { 'cellular': 0, 'telephone': 1, 'unknown': 2 };
    return contactMap[contact.toLowerCase()] || 2;
  }

  encodeMonth(month) {
    const monthMap = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    return monthMap[month.toLowerCase()] || 0;
  }

  encodePoutcome(poutcome) {
    const poutcomeMap = { 'failure': 0, 'nonexistent': 1, 'success': 2, 'unknown': 3 };
    return poutcomeMap[poutcome.toLowerCase()] || 3;
  }

  /**
   * Predict score for a lead
   * Returns probability score (0-1)
   */
  async predict(lead) {
    await this.loadModel();

    const featureVector = this.prepareFeatureVector(lead);
    
    // Convert to Float32Array as required by ONNX Runtime
    const inputTensor = new ort.Tensor('float32', Float32Array.from(featureVector), [1, featureVector.length]);
    
    // Get model input name (usually 'input' or check model metadata)
    const inputName = this.model.inputNames[0];
    
    const feeds = { [inputName]: inputTensor };
    const results = await this.model.run(feeds);
    
    // Get output (usually 'output' or check model metadata)
    const outputName = this.model.outputNames[0];
    const output = results[outputName];
    
    // Extract probability (assuming binary classification)
    const probability = output.data[1] || output.data[0]; // Adjust based on your model output
    
    return {
      score: parseFloat(probability),
      probability: parseFloat(probability),
      featureVector,
      modelVersion: this.modelVersion,
    };
  }

  getModelVersion() {
    return this.modelVersion;
  }
}

module.exports = new ModelService();