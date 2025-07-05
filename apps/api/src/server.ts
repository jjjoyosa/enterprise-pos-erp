import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tenantContext } from './middleware/tenant';
import { connectDB } from './config/db';
import authRoutes from './modules/auth/routes/auth.routes';
import productRoutes from './modules/products/routes/product.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'enterprise-pos-erp-api' });
});

// PUBLIC ROUTES
app.use('/api/v1/auth', authRoutes);

// Apply Tenant Middleware to all routes below this line
app.use(tenantContext);

// PROTECTED ROUTES
app.get('/api/v1/tenant-test', (req, res) => {
  res.json({ message: 'Tenant context injected.', active_tenant: req.tenantId });
});

// Product Module
app.use('/api/v1/products', productRoutes);

app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  console.log(`[API] Strict tenant isolation middleware is ACTIVE.`);
});