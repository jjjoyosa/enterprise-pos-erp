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


export interface ABCAnalysisData {
  summary: { A: number; B: number; C: number; };
  items: Array<{
    _id: string;
    name: string;
    sku: string;
    revenue: number;
    unitsSold: number;
    cumulativePercentage: number;
    grade: 'A' | 'B' | 'C';
    currentStock: number;
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


export const useABCAnalysis = (params?: { startDate: string; endDate: string }) => {
  return useQuery<ABCAnalysisData>({
    queryKey: ['abc-analysis', params],
    queryFn: async () => {
      const { data } = await api.get('/sales/abc-analysis', { params });
      return data;
    },
    refetchOnWindowFocus: true,
  });
};