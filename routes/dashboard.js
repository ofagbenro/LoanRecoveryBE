// routes/dashboard.js - Dashboard Statistics Routes
const express = require('express');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get loan statistics
    const [
      totalLoans,
      openLoans,
      closedLoans,
      totalCustomers
    ] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'open' }),
      Loan.countDocuments({ status: 'closed' }),
      Customer.countDocuments()
    ]);

    // Calculate total outstanding amount
    const outstandingLoans = await Loan.find({ status: 'open' });
    const totalOutstanding = outstandingLoans.reduce((total, loan) => {
      return total + (loan.balance || loan.calculateCurrentBalance());
    }, 0);

    // Get overdue loans count
    const overdueLoans = await Loan.countDocuments({
      status: 'open',
      dueDate: { $lt: new Date() }
    });

    // Monthly collection data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCollections = await Loan.aggregate([
      {
        $match: {
          status: 'closed',
          closedDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$closedDate' },
            month: { $month: '$closedDate' }
          },
          totalAmount: { $sum: '$principal' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalLoans,
        openLoans,
        closedLoans,
        totalCustomers,
        totalOutstanding,
        overdueLoans,
        monthlyCollections,
        collectionRate: totalLoans > 0 ? ((closedLoans / totalLoans) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent loan activities
// @access  Private
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const recentLoans = await Loan.find()
      .populate('customer', 'firstName lastName phone customerid')
      .sort({ updated_at: -1 })
      .limit(10);

    const recentlyDue = await Loan.find({
      status: 'open',
      dueDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    })
      .populate('customer', 'firstName lastName phone')
      .sort({ dueDate: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        recentLoans,
        recentlyDue
      }
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;