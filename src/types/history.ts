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

export interface AlertThresholds {
  // Percentage thresholds
  totalSizeIncreaseThreshold: number;  // e.g., 10 for 10%
  chunkSizeIncreaseThreshold: number;  // e.g., 15 for 15%
  
  // Absolute size thresholds (in bytes)
  maxTotalSize: number;                // e.g., 5MB = 5 * 1024 * 1024
  maxChunkSize: number;                // e.g., 2MB = 2 * 1024 * 1024
}

export interface Alert {
  type: 'total-size-increase' | 'chunk-size-increase' | 'max-size-exceeded' | 'max-chunk-size-exceeded';
  severity: 'warning' | 'error';
  message: string;
  details: {
    timestamp: string;
    previousValue?: number;
    currentValue: number;
    threshold: number;
    percentageChange?: number;
    chunkName?: string;
  };
}

export interface ExportData {
  version: string;
  exportDate: string;
  history: (BundleStats & { timestamp: string })[];
  alerts: Alert[];
  thresholds: AlertThresholds;
}

export interface ImportResult {
  success: boolean;
  message: string;
  entriesImported: number;
  alerts: Alert[];
}
