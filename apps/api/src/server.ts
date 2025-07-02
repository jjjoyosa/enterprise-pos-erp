import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tenantContext } from './middleware/tenant';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'enterprise-pos-erp-api' });
});


app.use(tenantContext);


app.get('/api/v1/tenant-test', (req, res) => {
  res.json({ 
    message: 'Tenant context successfully injected.',
    active_tenant: req.tenantId 
  });
});

app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  console.log(`[API] Strict tenant isolation middleware is ACTIVE.`);
});