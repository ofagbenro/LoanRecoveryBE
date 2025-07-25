// routes/loans.js - Loan Management Routes
const express = require('express');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/loans
// @desc    Get all loans with filtering and search
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      search,
      status,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    let query = {};
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.bookedDate = {};
      if (startDate) query.bookedDate.$gte = new Date(startDate);
      if (endDate) query.bookedDate.$lte = new Date(endDate);
    }

    // Build aggregation pipeline
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' }
    ];

    // Search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'customer.firstName': { $regex: search, $options: 'i' } },
            { 'customer.lastName': { $regex: search, $options: 'i' } },
            { 'customer.phone': { $regex: search, $options: 'i' } },
            { 'customer.customerid': { $regex: search, $options: 'i' } },
            { 'loaned': { $regex: search, $options: 'i' } },
            { 'description': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Sort by due date (overdue first)
    pipeline.push({
      $sort: { dueDate: 1, status: 1 }
    });

    // Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    const loans = await Loan.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = pipeline.slice(0, -2); // Remove skip and limit
    totalPipeline.push({ $count: 'total' });
    const totalResult = await Loan.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.json({
      success: true,
      data: loans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/loans/:id
// @desc    Get loan by ID with full details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('customer')
      .populate('transaction');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Calculate current balance
    const currentBalance = loan.calculateCurrentBalance();
    
    res.json({
      success: true,
      data: {
        ...loan.toObject(),
        currentBalance,
        isOverdue: loan.isOverdue
      }
    });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/loans/:id/status
// @desc    Update loan status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['open', 'closed', 'defaulted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.status = status;
    if (status === 'closed') {
      loan.closedDate = new Date();
      loan.balance = 0;
    }

    await loan.save();

    res.json({
      success: true,
      message: 'Loan status updated successfully',
      data: loan
    });
  } catch (error) {
    console.error('Update loan status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/loans/:id/notes
// @desc    Add note to loan
// @access  Private
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.notes.push({
      content,
      createdBy: req.user.username,
      createdAt: new Date()
    });

    await loan.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: loan.notes
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;