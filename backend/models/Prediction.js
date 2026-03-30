const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Please add a project ID']
  },
  projectName: {
    type: String,
    required: [true, 'Please add a project name']
  },
  predictionType: {
    type: String,
    enum: ['success', 'risk', 'completion', 'budget'],
    required: [true, 'Please add a prediction type']
  },
  successProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completionPrediction: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  budgetVariance: {
    type: Number,
    default: 0
  },
  recommendations: [{
    type: String
  }],
  factors: {
    budgetUtilization: Number,
    timeProgress: Number,
    completionRate: Number,
    teamSize: Number,
    riskLevel: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
predictionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Prediction', predictionSchema);
