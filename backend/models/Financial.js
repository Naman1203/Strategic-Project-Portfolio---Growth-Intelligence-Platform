const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Please add a project ID']
  },
  projectName: {
    type: String,
    required: [true, 'Please add a project name']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Salaries', 'Equipment', 'Software', 'Marketing', 'Travel', 'Training', 'Other', 'Revenue']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: 0
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  type: {
    type: String,
    enum: ['expense', 'revenue'],
    required: [true, 'Please add a type']
  },
  description: {
    type: String,
    default: ''
  },
  invoiceNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
financialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Financial', financialSchema);
