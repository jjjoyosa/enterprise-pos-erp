import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

interface DashboardMetrics {
  todayGross: number;
  todayCount: number;
  weeklyRevenue: Array<{ _id: string; total: number }>;
  lowStockItems: Array<{ _id: string; name: string; sku: string; currentStock: number }>;
}

const fetchMetrics = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get('/analytics/dashboard');
  return data;
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 60000, 
  });
};