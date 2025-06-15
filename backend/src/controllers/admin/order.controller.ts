import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Order } from '../../models/order.model'; // Adjust path
import mongoose from 'mongoose';

/**
 * @desc    Get all orders (admin view)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const { status, search } = req.query; // Filter by status or search

    const query: any = {};

    if (status && ['PENDING', 'COMPLETED', 'FAILED'].includes((status as string).toUpperCase())) {
      query.status = (status as string).toUpperCase();
    }

    // Allow searching by transaction_uuid or user's email (if populated)
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      // This requires an aggregation pipeline to search by populated fields effectively.
      // For simplicity, we'll stick to transaction_uuid for direct queries.
      // A more robust solution would use $lookup and $match in an aggregation.
      query.transaction_uuid = searchRegex;
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'username email') // Populate user info
      // *** THE FIX IS HERE ***
      // We now populate the productId field *inside* the items array
      .populate({
        path: 'items.productId',
        select: 'title originalPrice discountPrice images', // Select the fields you need
      })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error: any) {
    console.error('[Admin Order Controller] Get All Orders Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

/**
 * @desc    Get a single order by ID (admin view)
 * @route   GET /api/admin/orders/:id
 * @access  Private/Admin
 */
export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Invalid order ID format' });
      return;
    }
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username email photoURL')
      // *** THE FIX IS HERE ***
      // We populate the productId for each item in the items array
      .populate({
        path: 'items.productId',
        model: 'Product', // Explicitly specify the model to populate from
      });

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    console.error('[Admin Order Controller] Get Order By ID Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'Invalid order ID format' });
        return;
    }

    if (!status || !['PENDING', 'COMPLETED', 'FAILED'].includes(status.toUpperCase())) {
        res.status(400).json({ message: 'Invalid status provided. Must be one of: PENDING, COMPLETED, FAILED.' });
        return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }

    order.status = status.toUpperCase() as 'PENDING' | 'COMPLETED' | 'FAILED';
    const updatedOrder = await order.save();

    res.json(updatedOrder);

  } catch (error: any) {
    console.error('[Admin Order Controller] Update Order Status Error:', error.message);
    if (error.name === 'ValidationError') {
        res.status(400).json({ message: 'Validation Error', errors: error.errors });
    } else {
        res.status(500).json({ message: 'Server error while updating order status' });
    }
  }
};