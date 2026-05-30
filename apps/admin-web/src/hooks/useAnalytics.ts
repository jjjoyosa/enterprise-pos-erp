import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface AnalyticsData {
  totalRevenue: number;
  netProfit: number;
  orderCount: number;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
  }>;
  topProducts: Array<{
    name: string;
    totalSold: number;
  }>;
}

export const useAnalytics = (params?: { startDate: string; endDate: string }) => {
  return useQuery<AnalyticsData>({
    queryKey: ['dashboard-analytics', params],
    queryFn: async () => {
      const { data } = await api.get('/sales/analytics', { params });
      return data;
    },
    refetchInterval: 15000, 
    refetchOnWindowFocus: true,
  });
};