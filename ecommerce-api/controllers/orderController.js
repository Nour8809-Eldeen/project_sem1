const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

exports.createOrder = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('userId is required');
  }

  const cart = await Cart.findOne({ userId }).populate('items.product', 'name stock price');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product._id} not found`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
  }));

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  const order = await Order.create({
    userId,
    items: orderItems,
    totalPrice: cart.totalPrice,
    status: 'pending',
  });

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({ success: true, message: 'Order created successfully', data: order });
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  res.json({ success: true, message: 'Orders fetched successfully', data: orders });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, message: 'Order fetched successfully', data: order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  order.status = status;
  await order.save();
  res.json({ success: true, message: 'Order status updated successfully', data: order });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status === 'cancelled') {
    res.status(400);
    throw new Error('Order is already cancelled');
  }

  order.status = 'cancelled';
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  res.json({ success: true, message: 'Order cancelled successfully', data: order });
});
