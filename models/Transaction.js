// ================================
// models/Transaction.js - Transaction Schema
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['credit', 'debit'] },
  description: { type: String, required: true },
  modeOfPayment: { type: String, required: true },
  eventID: { type: String, required: true },
  amount: { type: Number, required: true },
  txdate: { type: Date, required: true },
  transactionid: { type: String, required: true, unique: true },
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

transactionSchema.index({ eventID: 1 });
transactionSchema.index({ transactionid: 1 });
transactionSchema.index({ txdate: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
