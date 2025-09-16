import express from 'express';
import { createOrder, updateOrderStatus, getOrderDetails, getUserOrders } from '../controllers/orderController.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Create a new order and initialize payment
router.post('/create', createOrder);

// Stripe webhook endpoint to update order status after payment
router.post('/webhook', updateOrderStatus);

// Get order details by reference number
router.get('/details/:reference', getOrderDetails);

// Get user's orders by email (for logged-in users or email verification)
router.get('/user/:email', auth, getUserOrders);

export default router;