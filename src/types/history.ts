export interface BundleStats {
  totalSize: number;
  gzipSize: number;
  brotliSize: number;
  chunks: {
    name: string;
    size: number;
    modules: {
      name: string;
      size: number;
    }[];
  }[];
  [key: string]: any;
}

export interface HistoryOptions {
  historyDir?: string;
  maxEntries?: number;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  averageSize: number;
  recommendations: string[];
}
