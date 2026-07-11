const mongoose = require('mongoose');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ success: true, message: 'Categories fetched successfully', data: categories });
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid category id');
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({ success: true, message: 'Category fetched successfully', data: category });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    res.status(400);
    throw new Error('Name and description are required');
  }

  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    res.status(409);
    throw new Error('Category already exists');
  }

  const category = await Category.create({ name, description });
  res.status(201).json({ success: true, message: 'Category created successfully', data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid category id');
  }

  const { name, description } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (name) {
    const duplicateCategory = await Category.findOne({ name: name.trim(), _id: { $ne: category._id } });
    if (duplicateCategory) {
      res.status(409);
      throw new Error('Category already exists');
    }
    category.name = name.trim();
  }

  if (description) {
    category.description = description.trim();
  }

  const updatedCategory = await category.save();
  res.json({ success: true, message: 'Category updated successfully', data: updatedCategory });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid category id');
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted successfully', data: null });
});
