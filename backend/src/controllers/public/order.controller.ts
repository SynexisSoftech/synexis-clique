import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Order } from '../../models/order.model'; // Adjust path
import mongoose from 'mongoose';
import { Product } from '../../models/product.model'; // Adjust path
import crypto from 'crypto';

/**
 * @desc    Create a new order and generate eSewa payment info
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items } = req.body as { items: { productId: string; quantity: number }[] };

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'Cannot create an order with no items' });
      return;
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        return;
      }
      const price = product.discountPrice || product.originalPrice;
      subtotal += price * item.quantity;
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: price,
      });
    }

    const shippingCost = subtotal > 0 ? 500 : 0;
    const taxAmount = Math.round(subtotal * 0.13); 
    const totalAmount = subtotal + shippingCost + taxAmount;
    const transaction_uuid = crypto.randomUUID();
    const product_code = "EPAYTEST"; // This is the correct code for development
    
    // The secret key for development/UAT is correct
    const secretKey = "8gBm/:&EnhH.1/q";

    // ✅ *** THE FIX IS HERE *** ✅
    // The signature string must be in this exact format and order.
    // Do NOT include success_url or failure_url here.
    const message = `total_amount=${totalAmount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      transaction_uuid,
      amount: subtotal,
      totalAmount: totalAmount,
      status: 'PENDING'
    });
    
    res.json({
      orderId: order._id,
      formAction: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      fields: {
        amount: totalAmount, // This should be the grand total
        tax_amount: "0", // Tax is already included in the total, so pass 0 as per docs
        total_amount: totalAmount, // The final grand total
        transaction_uuid,
        product_code,
        product_service_charge: "0",
        product_delivery_charge: "0",
        // The URLs are sent as form fields, but not included in the signature
        success_url: "http://localhost:3000/success", 
        failure_url: "http://localhost:3000/failure",
        signed_field_names: "total_amount,transaction_uuid,product_code", // Must match the signed fields
        signature
      },
    });

  } catch (error: any) {
    console.error("[Order Controller] Create Order Error:", error.message);
    res.status(500).json({ message: "Server error while creating order" });
  }
};
/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const query = { userId: req.user._id };

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('productId', 'title images originalPrice discountPrice') // Populate essential product info
      .select('-userId') // Don't need to return the user's own ID back to them
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
        orders,
        page,
        pages: Math.ceil(count / pageSize),
        count
    });

  } catch (error: any) {
    console.error('[User Order Controller] Get My Orders Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching your orders' });
  }
};


/**
 * @desc    Get a single one of logged-in user's orders by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getMyOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
          res.status(401).json({ message: 'Not authorized, user not found' });
          return;
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          res.status(400).json({ message: 'Invalid order ID format' });
          return;
      }

      // Crucially, we find by both order ID and the logged-in user's ID
      // to ensure a user cannot access another user's order.
      const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
        .populate('productId') // Get full product details for the order page
        .populate('userId', 'username email'); // Maybe for showing shipping details later

      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ message: 'Order not found or you are not authorized to view it' });
      }
    } catch (error: any) {
      console.error('[User Order Controller] Get My Order By ID Error:', error.message);
      res.status(500).json({ message: 'Server error while fetching your order' });
    }
  };