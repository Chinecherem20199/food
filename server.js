import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoute.js';
import foodRoutes from './routes/foodRoute.js';
import orderRoutes from './routes/orderRoute.js';
import paymentRoutes from './routes/paymentRoute.js';
import riderRoutes from './routes/riderRoute.js';

connectDB();

const app = express();

// ✅ THIS LINE FIXES req.body
app.use(express.json());

// ❌ REMOVE manual raw-body reader completely

app.use('/auth', authRoutes);
app.use('/foods', foodRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/riders', riderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

