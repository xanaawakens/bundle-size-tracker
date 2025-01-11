import { writeFile, readFile, mkdir } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { 
  BundleStats, 
  HistoryOptions, 
  TrendAnalysis, 
  HistoryQuery, 
  HistoryQueryResult,
  Alert,
  AlertThresholds,
  ExportData,
  ImportResult
} from '../../types/history';
import { BundleVisualizer } from './visualization';

const DEFAULT_THRESHOLDS: AlertThresholds = {
  totalSizeIncreaseThreshold: 10, // 10%
  chunkSizeIncreaseThreshold: 15, // 15%
  maxTotalSize: 5 * 1024 * 1024, // 5MB
  maxChunkSize: 2 * 1024 * 1024  // 2MB
};

export class BundleSizeHistory {
  private historyPath: string;
  private options: Required<HistoryOptions>;
  private visualizer: BundleVisualizer;
  private thresholds: AlertThresholds;
  private alerts: Alert[] = [];

  constructor(options: HistoryOptions = {}) {
    this.options = {
      historyDir: '.bundle-size-history',
      maxEntries: 100,
      ...options
    };
    this.historyPath = isAbsolute(this.options.historyDir)
      ? this.options.historyDir
      : join(process.cwd(), this.options.historyDir);
    this.visualizer = new BundleVisualizer(this.historyPath);
    this.thresholds = DEFAULT_THRESHOLDS;
  }

  async initialize(): Promise<void> {
    try {
      await mkdir(this.historyPath, { recursive: true });
    } catch (error: Error) {
      throw new Error(`Failed to create history directory: ${error.message}`);
    }
  }

  async saveSnapshot(stats: BundleStats): Promise<void> {
    const timestamp = new Date().toISOString();
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      let history: Array<BundleStats & { timestamp: string }> = [];
      try {
        const data = await readFile(historyFile, 'utf8');
        history = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet, start with empty history
      }

      // Check for alerts before adding new entry
      if (history.length > 0) {
        const previousEntry = history[history.length - 1];
        this.checkForAlerts(stats, previousEntry);
      }

      history.push({ timestamp, ...stats });

      // Keep only the latest entries based on maxEntries
      if (history.length > this.options.maxEntries) {
        history = history.slice(-this.options.maxEntries);
      }

      await writeFile(historyFile, JSON.stringify(history, null, 2));
      
      // Save alerts
      await this.saveAlerts();
    } catch (error: Error) {
      throw new Error(`Failed to save history: ${error.message}`);
    }
  }

  private async saveAlerts(): Promise<void> {
    const alertsFile = join(this.historyPath, 'alerts.json');
    try {
      await writeFile(alertsFile, JSON.stringify(this.alerts, null, 2));
    } catch (error: Error) {
      throw new Error(`Failed to save alerts: ${error.message}`);
    }
  }

  private checkForAlerts(currentStats: BundleStats, previousStats: BundleStats & { timestamp: string }): void {
    // Check total size increase
    const totalSizeChange = ((currentStats.totalSize - previousStats.totalSize) / previousStats.totalSize) * 100;
    if (totalSizeChange > this.thresholds.totalSizeIncreaseThreshold) {
      this.alerts.push({
        type: 'total-size-increase',
        severity: 'warning',
        message: `Total bundle size increased by ${totalSizeChange.toFixed(2)}%`,
        details: {
          timestamp: new Date().toISOString(),
          previousValue: previousStats.totalSize,
          currentValue: currentStats.totalSize,
          threshold: this.thresholds.totalSizeIncreaseThreshold,
          percentageChange: totalSizeChange
        }
      });
    }

    // Check max total size
    if (currentStats.totalSize > this.thresholds.maxTotalSize) {
      this.alerts.push({
        type: 'max-size-exceeded',
        severity: 'error',
        message: `Total bundle size (${currentStats.totalSize}) exceeds maximum allowed size (${this.thresholds.maxTotalSize})`,
        details: {
          timestamp: new Date().toISOString(),
          currentValue: currentStats.totalSize,
          threshold: this.thresholds.maxTotalSize
        }
      });
    }

    // Check individual chunks
    currentStats.chunks.forEach(currentChunk => {
      const previousChunk = previousStats.chunks.find(c => c.name === currentChunk.name);
      if (previousChunk) {
        const chunkSizeChange = ((currentChunk.size - previousChunk.size) / previousChunk.size) * 100;
        if (chunkSizeChange > this.thresholds.chunkSizeIncreaseThreshold) {
          this.alerts.push({
            type: 'chunk-size-increase',
            severity: 'warning',
            message: `Chunk "${currentChunk.name}" size increased by ${chunkSizeChange.toFixed(2)}%`,
            details: {
              timestamp: new Date().toISOString(),
              previousValue: previousChunk.size,
              currentValue: currentChunk.size,
              threshold: this.thresholds.chunkSizeIncreaseThreshold,
              percentageChange: chunkSizeChange,
              chunkName: currentChunk.name
            }
          });
        }
      }

      if (currentChunk.size > this.thresholds.maxChunkSize) {
        this.alerts.push({
          type: 'max-chunk-size-exceeded',
          severity: 'error',
          message: `Chunk "${currentChunk.name}" size (${currentChunk.size}) exceeds maximum allowed size (${this.thresholds.maxChunkSize})`,
          details: {
            timestamp: new Date().toISOString(),
            currentValue: currentChunk.size,
            threshold: this.thresholds.maxChunkSize,
            chunkName: currentChunk.name
          }
        });
      }
    });
  }

  async getAlerts(): Promise<Alert[]> {
    const alertsFile = join(this.historyPath, 'alerts.json');
    try {
      const data = await readFile(alertsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async setThresholds(thresholds: Partial<AlertThresholds>): Promise<void> {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds
    };
  }

  async exportHistory(): Promise<ExportData> {
    const historyFile = join(this.historyPath, 'history.json');
    try {
      const data = await readFile(historyFile, 'utf8');
      const history = JSON.parse(data);
      const alerts = await this.getAlerts();

      return {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        history,
        alerts,
        thresholds: this.thresholds
      };
    } catch (error: Error) {
      throw new Error(`Failed to export history: ${error.message}`);
    }
  }

  async importHistory(data: ExportData): Promise<ImportResult> {
    try {
      // Validate data
      if (!data.version || !data.history || !Array.isArray(data.history)) {
        return {
          success: false,
          message: 'Invalid export data format',
          entriesImported: 0,
          alerts: []
        };
      }

      // Import history
      const historyFile = join(this.historyPath, 'history.json');
      await writeFile(historyFile, JSON.stringify(data.history, null, 2));

      // Import alerts
      this.alerts = data.alerts || [];
      await this.saveAlerts();

      // Import thresholds
      if (data.thresholds) {
        this.thresholds = {
          ...this.thresholds,
          ...data.thresholds
        };
      }

      return {
        success: true,
        message: 'History imported successfully',
        entriesImported: data.history.length,
        alerts: this.alerts
      };
    } catch (error: Error) {
      return {
        success: false,
        message: `Failed to import history: ${error.message}`,
        entriesImported: 0,
        alerts: []
      };
    }
  }

  async analyzeTrends(): Promise<TrendAnalysis> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: Array<BundleStats & { timestamp: string }> = JSON.parse(data);

      if (history.length < 2) {
        return {
          trend: 'stable',
          percentageChange: 0,
          averageSize: history[0]?.totalSize || 0,
          recommendations: ['Not enough data for trend analysis']
        };
      }

      const latest = history[history.length - 1];
      const previous = history[history.length - 2];
      const percentageChange = ((latest.totalSize - previous.totalSize) / previous.totalSize) * 100;

      // Calculate average size over time
      const averageSize = history.reduce((sum: number, entry: BundleStats & { timestamp: string }) => sum + entry.totalSize, 0) / history.length;

      // Determine trend and generate recommendations
      const trend = this.determineTrend(percentageChange);
      const recommendations = this.generateRecommendations(trend, percentageChange, history);

      return {
        trend,
        percentageChange,
        averageSize,
        recommendations
      };
    } catch (error: Error) {
      throw new Error(`Failed to analyze trends: ${error.message}`);
    }
  }

  async generateReport(): Promise<string> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: Array<BundleStats & { timestamp: string }> = JSON.parse(data);
      return await this.visualizer.generateReport(history);
    } catch (error: Error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  async queryHistory(query: HistoryQuery = {}): Promise<HistoryQueryResult> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      let history: Array<BundleStats & { timestamp: string }> = JSON.parse(data);

      // Apply date filters
      if (query.startDate) {
        history = history.filter(entry => 
          new Date(entry.timestamp) >= query.startDate!
        );
      }
      if (query.endDate) {
        history = history.filter(entry => 
          new Date(entry.timestamp) <= query.endDate!
        );
      }

      // Apply size filters
      if (query.minSize) {
        history = history.filter(entry => entry.totalSize >= query.minSize!);
      }
      if (query.maxSize) {
        history = history.filter(entry => entry.totalSize <= query.maxSize!);
      }

      // Apply chunk filters
      if (query.chunkNames && query.chunkNames.length > 0) {
        history = history.filter(entry =>
          entry.chunks.some(chunk => 
            query.chunkNames!.includes(chunk.name)
          )
        );
      }

      // Calculate summary
      const summary = {
        averageSize: history.length > 0 
          ? history.reduce((sum, entry) => sum + entry.totalSize, 0) / history.length 
          : 0,
        minSize: history.length > 0 
          ? Math.min(...history.map(entry => entry.totalSize))
          : 0,
        maxSize: history.length > 0 
          ? Math.max(...history.map(entry => entry.totalSize))
          : 0,
        totalEntries: history.length
      };

      // Apply sorting
      const sortBy = query.sortBy || 'date';
      const sortOrder = query.sortOrder || 'desc';
      
      history.sort((a, b) => {
        let valueA: number | Date, valueB: number | Date;
        
        switch (sortBy) {
          case 'date':
            valueA = new Date(a.timestamp);
            valueB = new Date(b.timestamp);
            break;
          case 'totalSize':
            valueA = a.totalSize;
            valueB = b.totalSize;
            break;
          case 'gzipSize':
            valueA = a.gzipSize;
            valueB = b.gzipSize;
            break;
          case 'brotliSize':
            valueA = a.brotliSize;
            valueB = b.brotliSize;
            break;
          default:
            valueA = new Date(a.timestamp);
            valueB = new Date(b.timestamp);
        }

        if (valueA instanceof Date && valueB instanceof Date) {
          return sortOrder === 'asc' 
            ? valueA.getTime() - valueB.getTime()
            : valueB.getTime() - valueA.getTime();
        }

        return sortOrder === 'asc' 
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      });

      // Apply pagination
      const limit = query.limit || 10;
      const offset = query.offset || 0;
      const paginatedHistory = history.slice(offset, offset + limit);

      return {
        entries: paginatedHistory,
        total: history.length,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < history.length
        },
        summary
      };
    } catch (error: Error) {
      if (error.code === 'ENOENT') {
        return {
          entries: [],
          total: 0,
          pagination: {
            limit: query.limit || 10,
            offset: query.offset || 0,
            hasMore: false
          },
          summary: {
            averageSize: 0,
            minSize: 0,
            maxSize: 0,
            totalEntries: 0
          }
        };
      }
      throw new Error(`Failed to query history: ${error.message}`);
    }
  }

  async getChunkNames(): Promise<string[]> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: Array<BundleStats & { timestamp: string }> = JSON.parse(data);
      
      const chunkNames = new Set<string>();
      history.forEach(entry => {
        entry.chunks.forEach(chunk => {
          chunkNames.add(chunk.name);
        });
      });
      
      return Array.from(chunkNames).sort();
    } catch (error: Error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to get chunk names: ${error.message}`);
    }
  }

  async getDateRange(): Promise<{ earliest: Date | null; latest: Date | null }> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: Array<BundleStats & { timestamp: string }> = JSON.parse(data);
      
      if (history.length === 0) {
        return { earliest: null, latest: null };
      }

      const timestamps = history.map(entry => new Date(entry.timestamp).getTime());
      return {
        earliest: new Date(Math.min(...timestamps)),
        latest: new Date(Math.max(...timestamps))
      };
    } catch (error: Error) {
      if (error.code === 'ENOENT') {
        return { earliest: null, latest: null };
      }
      throw new Error(`Failed to get date range: ${error.message}`);
    }
  }

  async getSizeRange(): Promise<{ min: number; max: number; average: number }> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: Array<BundleStats & { timestamp: string }> = JSON.parse(data);
      
      if (history.length === 0) {
        return { min: 0, max: 0, average: 0 };
      }

      const sizes = history.map(entry => entry.totalSize);
      return {
        min: Math.min(...sizes),
        max: Math.max(...sizes),
        average: sizes.reduce((a, b) => a + b, 0) / sizes.length
      };
    } catch (error: Error) {
      if (error.code === 'ENOENT') {
        return { min: 0, max: 0, average: 0 };
      }
      throw new Error(`Failed to get size range: ${error.message}`);
    }
  }

  private determineTrend(percentageChange: number): 'increasing' | 'decreasing' | 'stable' {
    if (percentageChange > 1) return 'increasing';
    if (percentageChange < -1) return 'decreasing';
    return 'stable';
  }

  private generateRecommendations(
    trend: string,
    percentageChange: number,
    history: Array<BundleStats & { timestamp: string }>
  ): string[] {
    const recommendations: string[] = [];

    if (trend === 'increasing' && percentageChange > 5) {
      recommendations.push('Significant bundle size increase detected. Consider:');
      recommendations.push('- Reviewing recent dependency additions');
      recommendations.push('- Analyzing code splitting opportunities');
      recommendations.push('- Checking for duplicate dependencies');
    }

    if (trend === 'stable') {
      recommendations.push('Bundle size is stable. Consider:');
      recommendations.push('- Setting up size budgets for future monitoring');
      recommendations.push('- Exploring optimization opportunities');
    }

    if (history.length > 30) {
      recommendations.push('- Consider archiving older history entries');
    }

    return recommendations;
  }
}
