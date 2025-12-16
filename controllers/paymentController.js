import axios from 'axios';
import Order from '../models/order.js';
import crypto from 'crypto';

// PAYSTACK - initialize transaction
export const paystackInit = async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const payload = {
        email: req.user.email,
        amount: order.totalAmount * 100,
        reference: `order-${order._id}`
    };
    const r = await axios.post(
        `${process.env.PAYSTACK_BASE}/transaction/initialize`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        }
    );
    order.paymentInfo = { provider: 'paystack', ref: r.data.data.reference };
    await order.save();
    res.json(r.data);
};
// PAYSTACK - verify transaction (server -> paystack)
export const paystackVerify = async (req, res) => {
    const { reference } = req.params;
    const r = await axios.get(
        `${process.env.PAYSTACK_BASE}/transaction/verify/${reference}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        }
    );
    const ref = r.data.data.reference;
    const orderId = ref.replace('order-', '');
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (r.data.data.status === 'success') {
        order.paid = true;
        await order.save();
    }
    res.json(r.data);
};

// PAYSTACK - webhook handler
export const paystackWebhook = async (req, res) => {
    // Paystack sends x-paystack-signature header: HMAC SHA512 of raw body using your secret key
    const signature = req.headers['x-paystack-signature'];
    const raw = req.rawBody || JSON.stringify(req.body);
    const h = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(raw)
        .digest('hex');
    if (h !== signature) return res.status(401).send('Invalid signature');
    const event = req.body;
    const reference = event?.data?.reference;
    if (!reference) return res.status(400).send('No reference');
    const orderId = reference.replace('order-', '');
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send('Order not found');
    if (event.event === 'charge.success' || event.data?.status === 'success') {
        order.paid = true;
        await order.save();
    }
    res.json({ status: 'ok' });
};
// FLUTTERWAVE - initialize (example)
// export const flwInit = async (req, res) => {
//     const { orderId } = req.body;
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     const payload = {
//         tx_ref: `order-${order._id}`,
//         amount: order.totalAmount,
//         currency: 'NGN',
//         redirect_url: `${process.env.FRONTEND_URL}/payments/callback`,
//         customer: { email: req.user.email }
//     };
//     const r = await axios.post(`${process.env.FLW_BASE}/payments`, payload, {
//         headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }
//     });
//     order.paymentInfo = { provider: 'flutterwave', ref: r.data.data.tx_ref };
//     await order.save();
//     res.json(r.data);
// };

// FLUTTERWAVE - webhook
// export const flwWebhook = async (req, res) => {
//     // Flutterwave uses verif-hash header if you set secret hash in dashboard
//     const signature = req.headers['verif-hash'];
//     const raw = req.rawBody || JSON.stringify(req.body);
//     const computed = crypto
//         .createHmac(
//             'sha256',
//             process.env.WEBHOOK_SECRET_FLW || process.env.FLW_SECRET_KEY
//         )
//         .update(raw)
//         .digest('hex');
//     if (
//         signature &&
//         !crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
//     )
//         return res.status(401).send('Invalid signature');
//     const data = req.body;
//     const ref = data?.data?.tx_ref || data?.tx_ref || data?.data?.id;
//     // tx_ref is expected to be 'order-<orderId>'
//     const orderId = String(ref).replace('order-', '');
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).send('Order not found');
//     if (data?.data?.status === 'successful' || data?.status === 'successful') {
//         order.paid = true;
//         await order.save();
//     }
//     res.json({ status: 'ok' });
// };
