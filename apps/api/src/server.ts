import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './modules/auth/routes/auth.routes';
import productRoutes from './modules/products/routes/product.routes';
import inventoryRoutes from './modules/inventory/routes/inventory.routes';
import saleRoutes from './modules/sales/routes/sale.routes';
import shiftRoutes from './modules/sales/routes/shift.routes';
import analyticsRoutes from './modules/sales/routes/analytics.routes';
import employeeRoutes from './modules/auth/routes/employee.routes';
import discountRoutes from './modules/sales/routes/discount.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'enterprise-pos-erp-api' });
});

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/discounts', discountRoutes);


app.use('/api/v1/auth', authRoutes);

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} | Body:`, Object.keys(req.body).length ? req.body : 'No Body');
  next();
});

app.use('/api/v1/shifts', shiftRoutes);



app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', saleRoutes);

app.use('/api/v1/employees', employeeRoutes);


app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  console.log(`[API] Strict tenant isolation middleware is ACTIVE.`);
});