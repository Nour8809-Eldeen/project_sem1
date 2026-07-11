const mongoose = require('mongoose');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  return res.json({ success: true, message: 'Categories fetched successfully', data: categories });
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

  return res.json({ success: true, message: 'Category fetched successfully', data: category });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedDescription = typeof description === 'string' ? description.trim() : '';

  if (!trimmedName || !trimmedDescription) {
    res.status(400);
    throw new Error('Name and description are required');
  }

  const existingCategory = await Category.findOne({ name: trimmedName });
  if (existingCategory) {
    res.status(409);
    throw new Error('Category already exists');
  }

  const category = await Category.create({ name: trimmedName, description: trimmedDescription });
  return res.status(201).json({ success: true, message: 'Category created successfully', data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid category id');
  }

  const { name, description } = req.body;
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedDescription = typeof description === 'string' ? description.trim() : '';

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (trimmedName) {
    const duplicateCategory = await Category.findOne({ name: trimmedName, _id: { $ne: category._id } });
    if (duplicateCategory) {
      res.status(409);
      throw new Error('Category already exists');
    }
    category.name = trimmedName;
  }

  if (trimmedDescription) {
    category.description = trimmedDescription;
  }

  const updatedCategory = await category.save();
  return res.json({ success: true, message: 'Category updated successfully', data: updatedCategory });
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
  return res.json({ success: true, message: 'Category deleted successfully', data: null });
});
