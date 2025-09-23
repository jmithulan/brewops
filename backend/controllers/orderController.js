import { Stripe } from 'stripe';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configure nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Create a new order and initialize Stripe payment
export const createOrder = async (req, res) => {
  try {
    const { 
      name, email, phone, address, city, postalCode, country,
      productId, productName, price, quantity, totalAmount 
    } = req.body;

    // Basic validation
    if (!name || !email || !phone || !address || !city || !postalCode || !productName) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Generate order reference number
    const orderReference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create a new order in the database (pending payment)
    const order = new Order({
      orderReference,
      customer: {
        name,
        email,
        phone,
        address: {
          street: address,
          city,
          postalCode,
          country
        }
      },
      items: [{
        productId,
        name: productName,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      }],
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: productName,
            description: `${quantity} x ${productName}`,
          },
          unit_amount: Math.round(parseFloat(price) * 100), // Stripe requires amount in cents
        },
        quantity: parseInt(quantity),
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order/success?reference=${orderReference}`,
      cancel_url: `${process.env.FRONTEND_URL}/order/cancel?reference=${orderReference}`,
      customer_email: email,
      metadata: {
        orderReference,
      },
    });

    // Update order with Stripe session ID
    order.paymentDetails = {
      provider: 'stripe',
      sessionId: session.id
    };
    await order.save();

    // Return success response with payment link
    res.json({
      success: true,
      paymentLink: session.url,
      orderReference
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to process order' });
  }
};

// Update order status after payment webhook from Stripe
export const updateOrderStatus = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderReference = session.metadata.orderReference;

      // Update order status in database
      const order = await Order.findOne({ orderReference });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.status = 'confirmed';
      order.paymentStatus = 'paid';
      await order.save();

      // Send confirmation email to customer
      await sendOrderConfirmationEmail(order);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
};

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const { reference } = req.params;

    const order = await Order.findOne({ orderReference: reference });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  try {
    // HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <div style="background-color: #16a34a; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Order Confirmation</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${order.customer.name},</p>
          <p>Thank you for your order! We're pleased to confirm that we've received your payment and your order is being processed.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <p><strong>Order Reference:</strong> ${order.orderReference}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> LKR ${order.totalAmount.toFixed(2)}</p>
          </div>
          
          <h3>Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0;">Product</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">LKR ${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">LKR ${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0;"><strong>Shipping Address:</strong></p>
            <p style="margin: 5px 0 0;">
              ${order.customer.name}<br>
              ${order.customer.address.street}<br>
              ${order.customer.address.city}, ${order.customer.address.postalCode}<br>
              ${order.customer.address.country}
            </p>
          </div>
          
          <p>If you have any questions about your order, please contact us at <a href="mailto:support@brewopstea.lk">support@brewopstea.lk</a>.</p>
          
          <p>Thank you for choosing BrewOps Tea Factory!</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #64748b;">
          <p>&copy; ${new Date().getFullYear()} BrewOps Tea Factory. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"BrewOps Tea Factory" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderReference}`,
      html: htmlContent,
    });

    console.log(`Confirmation email sent to ${order.customer.email}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

// Get user's orders by email (for notifications)
export const getUserOrders = async (req, res) => {
  try {
    const { email } = req.params;
    
    const orders = await Order.find({ 'customer.email': email })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};