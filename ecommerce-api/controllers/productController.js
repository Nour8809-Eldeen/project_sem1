const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

exports.getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, search, sort, page = 1, limit = 10 } = req.query;

  const query = {};

  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? -1 : 1;
    sortOption = { [sortField]: sortDirection };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name description')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    message: 'Products fetched successfully',
    data: products,
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      count: products.length,
    },
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product id');
  }

  const product = await Product.findById(req.params.id).populate('category', 'name description');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, message: 'Product fetched successfully', data: product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, image } = req.body;

  if (!name || !description || price === undefined || !category || stock === undefined) {
    res.status(400);
    throw new Error('Name, description, price, category, and stock are required');
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    res.status(400);
    throw new Error('Invalid category id');
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    throw new Error('Category not found');
  }

  const product = await Product.create({ name, description, price, category, stock, image: image || '' });
  res.status(201).json({ success: true, message: 'Product created successfully', data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product id');
  }

  const { name, description, price, category, stock, image } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      res.status(400);
      throw new Error('Invalid category id');
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404);
      throw new Error('Category not found');
    }

    product.category = category;
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (image !== undefined) product.image = image;

  const updatedProduct = await product.save();
  res.json({ success: true, message: 'Product updated successfully', data: updatedProduct });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product id');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully', data: null });
});
