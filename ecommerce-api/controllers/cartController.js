const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

const recalculateCart = (cart) => {
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
};

exports.addToCart = asyncHandler(async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  if (!userId || !productId) {
    res.status(400);
    throw new Error('userId and productId are required');
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error('Invalid product id');
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [], totalPrice: 0 });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = product.price;
  } else {
    cart.items.push({ product: product._id, quantity, price: product.price });
  }

  recalculateCart(cart);
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price');
  res.status(201).json({ success: true, message: 'Item added to cart', data: populatedCart });
});

exports.getCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ userId }).populate('items.product', 'name price');

  if (!cart) {
    return res.json({ success: true, message: 'Cart is empty', data: { userId, items: [], totalPrice: 0 } });
  }

  res.json({ success: true, message: 'Cart fetched successfully', data: cart });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  item.quantity = quantity;
  recalculateCart(cart);
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price');
  res.json({ success: true, message: 'Cart updated successfully', data: populatedCart });
});

exports.removeCartItem = asyncHandler(async (req, res) => {
  const { userId, productId } = req.params;
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  recalculateCart(cart);
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price');
  res.json({ success: true, message: 'Item removed from cart', data: populatedCart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.json({ success: true, message: 'Cart cleared successfully', data: cart });
});
