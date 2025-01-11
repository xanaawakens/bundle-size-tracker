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

export interface HistoryQuery {
  // Time range
  startDate?: Date;
  endDate?: Date;
  
  // Size filters
  minSize?: number;
  maxSize?: number;
  
  // Chunk filters
  chunkNames?: string[];
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Sorting
  sortBy?: 'date' | 'totalSize' | 'gzipSize' | 'brotliSize';
  sortOrder?: 'asc' | 'desc';
}

export interface HistoryQueryResult {
  entries: (BundleStats & { timestamp: string })[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: {
    averageSize: number;
    minSize: number;
    maxSize: number;
    totalEntries: number;
  };
}
