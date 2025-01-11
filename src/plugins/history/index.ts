import { writeFile, readFile, mkdir } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { BundleStats, HistoryOptions, TrendAnalysis, HistoryQuery, HistoryQueryResult } from '../../types/history';
import { BundleVisualizer } from './visualization';

export class BundleSizeHistory {
  private historyPath: string;
  private options: Required<HistoryOptions>;
  private visualizer: BundleVisualizer;

  constructor(options: HistoryOptions = {}) {
    this.options = {
      historyDir: '.bundle-size-history',
      maxEntries: 100,
      ...options
    };
    // If historyDir is absolute path, use it directly
    this.historyPath = isAbsolute(this.options.historyDir)
      ? this.options.historyDir
      : join(process.cwd(), this.options.historyDir);
    this.visualizer = new BundleVisualizer(this.historyPath);
  }

  async initialize(): Promise<void> {
    try {
      await mkdir(this.historyPath, { recursive: true });
    } catch (error: any) {
      throw new Error(`Failed to create history directory: ${error.message}`);
    }
  }

  async saveSnapshot(stats: BundleStats): Promise<void> {
    const timestamp = new Date().toISOString();
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      let history = [];
      try {
        const data = await readFile(historyFile, 'utf8');
        history = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet, start with empty history
      }

      history.push({ timestamp, ...stats });

      // Keep only the latest entries based on maxEntries
      if (history.length > this.options.maxEntries) {
        history = history.slice(-this.options.maxEntries);
      }

      await writeFile(historyFile, JSON.stringify(history, null, 2));
    } catch (error: any) {
      throw new Error(`Failed to save history: ${error.message}`);
    }
  }

  async analyzeTrends(): Promise<TrendAnalysis> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history = JSON.parse(data);

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
    } catch (error: any) {
      throw new Error(`Failed to analyze trends: ${error.message}`);
    }
  }

  async generateReport(): Promise<string> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history = JSON.parse(data);
      return await this.visualizer.generateReport(history);
    } catch (error: any) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  async queryHistory(query: HistoryQuery = {}): Promise<HistoryQueryResult> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      let history: (BundleStats & { timestamp: string })[] = JSON.parse(data);

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

      // Calculate summary before pagination
      const summary = {
        averageSize: history.reduce((sum: number, entry) => sum + entry.totalSize, 0) / history.length,
        minSize: Math.min(...history.map(entry => entry.totalSize)),
        maxSize: Math.max(...history.map(entry => entry.totalSize)),
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
    } catch (error: any) {
      throw new Error(`Failed to query history: ${error.message}`);
    }
  }

  async getChunkNames(): Promise<string[]> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: BundleStats[] = JSON.parse(data);
      
      const chunkNames = new Set<string>();
      history.forEach(entry => {
        entry.chunks.forEach(chunk => {
          chunkNames.add(chunk.name);
        });
      });
      
      return Array.from(chunkNames).sort();
    } catch (error: any) {
      throw new Error(`Failed to get chunk names: ${error.message}`);
    }
  }

  async getDateRange(): Promise<{ earliest: Date; latest: Date }> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: (BundleStats & { timestamp: string })[] = JSON.parse(data);
      
      const timestamps = history.map(entry => new Date(entry.timestamp).getTime());
      return {
        earliest: new Date(Math.min(...timestamps)),
        latest: new Date(Math.max(...timestamps))
      };
    } catch (error: any) {
      throw new Error(`Failed to get date range: ${error.message}`);
    }
  }

  async getSizeRange(): Promise<{ min: number; max: number; average: number }> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history: BundleStats[] = JSON.parse(data);
      
      const sizes = history.map(entry => entry.totalSize);
      return {
        min: Math.min(...sizes),
        max: Math.max(...sizes),
        average: sizes.reduce((a, b) => a + b, 0) / sizes.length
      };
    } catch (error: any) {
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
    history: BundleStats[]
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
