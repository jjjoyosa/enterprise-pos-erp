import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';


export interface AnalyticsData {
  todaysRevenue: number;
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

export const useAnalytics = () => {
  
  return useQuery<AnalyticsData>({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/sales/analytics');
      return data;
    },
    refetchInterval: 15000, 
    refetchOnWindowFocus: true,
  });
};

