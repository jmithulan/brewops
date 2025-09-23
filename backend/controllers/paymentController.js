import Payment from "../models/Payment.js";

// REQ-4: Staff view all supplier payment records
export async function getAllPayments(req, res) {
  try {
    const { page = 1, limit = 20, supplier_id, date_from, date_to, status, payment_method } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (supplier_id) filters.supplier_id = supplier_id;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (status) filters.status = status;
    if (payment_method) filters.payment_method = payment_method;

    const payments = await Payment.findAll(parseInt(limit), offset, filters);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: payments.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Create payment
export async function createPayment(req, res) {
  try {
    const paymentData = {
      created_by: req.user.id,
      ...req.body
    };

    // Validate required fields
    if (!paymentData.supplier_id || !paymentData.amount || !paymentData.payment_date || !paymentData.payment_method) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: supplier_id, amount, payment_date, payment_method"
      });
    }

    const payment = await Payment.create(paymentData);
    
    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get payment by ID
export async function getPaymentById(req, res) {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Update payment
export async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const updatedPayment = await Payment.update(id, req.body);
    
    res.json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Complete payment
export async function completePayment(req, res) {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const updatedPayment = await Payment.update(id, { status: 'completed' });
    
    res.json({
      success: true,
      message: "Payment completed successfully",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Complete payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Cancel payment
export async function cancelPayment(req, res) {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const updatedPayment = await Payment.update(id, { status: 'cancelled' });
    
    res.json({
      success: true,
      message: "Payment cancelled",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get payment summary for supplier
export async function getPaymentSummary(req, res) {
  try {
    const { supplier_id } = req.params;
    const { date_from, date_to } = req.query;
    
    if (!date_from || !date_to) {
      return res.status(400).json({
        success: false,
        message: "date_from and date_to parameters are required"
      });
    }

    const summary = await Payment.getPaymentSummary(supplier_id, date_from, date_to);

    res.json({
      success: true,
      supplier_id,
      date_from,
      date_to,
      summary
    });
  } catch (error) {
    console.error("Get payment summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// REQ-5: Daily payment reports
export async function getDailyPaymentReport(req, res) {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }

    const report = await Payment.getDailyPayments(date);

    res.json({
      success: true,
      date,
      report
    });
  } catch (error) {
    console.error("Get daily payment report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// REQ-5: Monthly payment reports
export async function getMonthlyPaymentReport(req, res) {
  try {
    const { year, month } = req.params;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month parameters are required"
      });
    }

    const report = await Payment.getMonthlyPayments(parseInt(year), parseInt(month));

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      report
    });
  } catch (error) {
    console.error("Get monthly payment report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}