import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    paystackInit,
    paystackVerify,
    paystackWebhook,

} from '../controllers/paymentController.js';

const router = express.Router();
router.post('/paystack/init', protect, paystackInit);
router.get('/paystack/verify/:reference', paystackVerify);
// Paystack webhook expects raw body and x-paystack-signature header
router.post('/paystack/webhook', express.raw({ type: '*/*' }), paystackWebhook);

export default router;
