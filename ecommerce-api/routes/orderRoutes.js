const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', createOrder);
router.get('/user/:userId', getUserOrders);
router.get('/:orderId', getOrderById);
router.put('/:orderId/status', updateOrderStatus);
router.delete('/:orderId', cancelOrder);

module.exports = router;
