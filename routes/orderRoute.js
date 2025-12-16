import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createOrder,
    getMyOrders,
    assignNearestRider
} from '../controllers/orderController.js';

const router = express.Router();
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.post('/:id/assign-rider', protect, assignNearestRider);

export default router;
