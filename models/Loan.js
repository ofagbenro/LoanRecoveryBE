// ================================
// models/Loan.js - Loan Schema
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  lastInterestUpdate: Date,
  upfrontFee: { type: String, default: 'Pending' },
  transaction: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  type: { type: String, required: true, enum: ['Business', 'Personal', 'Emergency'] },
  description: { type: String, required: true },
  principal: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  guarantor: String,
  guarantorNumber: String,
  upfrontAmount: { type: Number, default: 0 },
  association: String,
  associationNo: String,
  requiredDate: Date,
  dueDate: { type: Date, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  status: { type: String, enum: ['open', 'closed', 'defaulted'], default: 'open' },
  loaned: { type: String, required: true, unique: true },
  requested_at: { type: Date, default: Date.now },
  balance: { type: Number, default: 0 },
  bookedDate: { type: Date, required: true },
  estimatedBalance: { type: Number, default: 0 },
  estimatedInterest: { type: Number, default: 0 },
  interestIncurred: { type: Number, default: 0 },
  tenure: { type: Number, required: true }, // in days
  closedDate: Date,
  notes: [{ 
    content: String, 
    createdBy: String, 
    createdAt: { type: Date, default: Date.now } 
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
loanSchema.index({ status: 1 });
loanSchema.index({ customer: 1 });
loanSchema.index({ dueDate: 1 });
loanSchema.index({ bookedDate: 1 });
loanSchema.index({ loaned: 1 });
loanSchema.index({ type: 1 });

// Virtual for calculating if loan is overdue
loanSchema.virtual('isOverdue').get(function() {
  return this.status === 'open' && new Date() > new Date(this.dueDate);
});

// Method to calculate current balance with interest
loanSchema.methods.calculateCurrentBalance = function() {
  if (this.status === 'closed') return 0;
  
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const bookedDate = new Date(this.bookedDate);
  
  // Calculate days elapsed
  const daysElapsed = Math.floor((now - bookedDate) / (1000 * 60 * 60 * 24));
  
  // Calculate interest (simple interest)
  const dailyInterestRate = this.interestRate / 100 / 365;
  const accruedInterest = this.principal * dailyInterestRate * daysElapsed;
  
  return this.principal + accruedInterest;
};

module.exports = mongoose.model('Loan', loanSchema);
