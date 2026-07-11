const express = require('express');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCart);
router.put('/update/:userId/:productId', updateCartItem);
router.delete('/remove/:userId/:productId', removeCartItem);
router.delete('/clear/:userId', clearCart);

module.exports = router;
