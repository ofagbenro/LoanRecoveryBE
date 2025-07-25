// ================================
// models/Customer.js - Customer Schema
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerTitle: { type: String, required: true },
  gender: { type: String, required: true },
  maritalStatus: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  nationality: { type: String, default: 'Nigerian' },
  placeOfBirth: String,
  mumMaidenName: String,
  contactAddress: { type: String, required: true },
  qualification: String,
  nok: String, // Next of Kin
  nokRelationship: String,
  nokNumber: String,
  nokAddress: String,
  dateOfBirth: Date,
  tradeAssoName: String,
  tradeSpecialization: String,
  tradeNumber: String,
  tradeMonthlyIncome: String,
  employMode: String,
  jobTitle: String,
  companyName: String,
  companyAddress: String,
  companyIndustry: String,
  companyEmail: String,
  nameOfBank: String,
  accountName: String,
  accountNumber: String,
  bvn: String,
  customerid: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  loans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Loan' }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better search performance
customerSchema.index({ firstName: 'text', lastName: 'text', phone: 'text', customerid: 'text' });
customerSchema.index({ phone: 1 });
customerSchema.index({ customerid: 1 });

module.exports = mongoose.model('Customer', customerSchema);
