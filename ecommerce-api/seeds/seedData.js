const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    await Category.deleteMany({});
    await Product.deleteMany({});

    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Gadgets and electronics' },
      { name: 'Furniture', description: 'Home and office furniture' },
      { name: 'Accessories', description: 'Useful accessories' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Food', description: 'Groceries and snacks' },
    ]);

    const categoryMap = Object.fromEntries(categories.map((category) => [category.name, category._id]));

    const products = [
      { name: 'Smartphone', description: 'Flagship smartphone', price: 699, category: categoryMap.Electronics, stock: 20, image: '' },
      { name: 'Laptop', description: 'Portable laptop', price: 999, category: categoryMap.Electronics, stock: 15, image: '' },
      { name: 'Wireless Headphones', description: 'Noise-cancelling headphones', price: 199, category: categoryMap.Electronics, stock: 30, image: '' },
      { name: 'Office Chair', description: 'Ergonomic office chair', price: 129, category: categoryMap.Furniture, stock: 12, image: '' },
      { name: 'Coffee Table', description: 'Modern coffee table', price: 159, category: categoryMap.Furniture, stock: 8, image: '' },
      { name: 'Desk Lamp', description: 'Adjustable desk lamp', price: 49, category: categoryMap.Furniture, stock: 18, image: '' },
      { name: 'Backpack', description: 'Travel backpack', price: 59, category: categoryMap.Accessories, stock: 25, image: '' },
      { name: 'Sunglasses', description: 'Stylish sunglasses', price: 39, category: categoryMap.Accessories, stock: 22, image: '' },
      { name: 'Phone Case', description: 'Protective phone case', price: 19, category: categoryMap.Accessories, stock: 40, image: '' },
      { name: 'T-Shirt', description: 'Cotton t-shirt', price: 24, category: categoryMap.Clothing, stock: 35, image: '' },
      { name: 'Jeans', description: 'Classic denim jeans', price: 54, category: categoryMap.Clothing, stock: 20, image: '' },
      { name: 'Sneakers', description: 'Comfortable sneakers', price: 79, category: categoryMap.Clothing, stock: 16, image: '' },
      { name: 'Coffee Beans', description: 'Fresh roasted coffee', price: 15, category: categoryMap.Food, stock: 30, image: '' },
      { name: 'Chocolate Box', description: 'Assorted chocolates', price: 18, category: categoryMap.Food, stock: 28, image: '' },
      { name: 'Trail Mix', description: 'Healthy snack mix', price: 12, category: categoryMap.Food, stock: 27, image: '' },
    ];

    await Product.insertMany(products);
    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    process.exit();
  }
};

seedData();
