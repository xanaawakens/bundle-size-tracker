import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { BundleVisualizer } from './visualization';

const DEFAULT_THRESHOLDS = {
  totalSizeIncreaseThreshold: 10, // 10%
  chunkSizeIncreaseThreshold: 15, // 15%
  maxTotalSize: 5 * 1024 * 1024, // 5MB
  maxChunkSize: 2 * 1024 * 1024  // 2MB
};

export class BundleSizeHistory {
  private readonly historyPath: string;
  private readonly maxEntries: number;
  private readonly visualizer: BundleVisualizer;

  constructor(options = {}) {
    this.historyPath = options.historyDir || '.bundle-size-history';
    this.maxEntries = options.maxEntries || 100;
    this.visualizer = new BundleVisualizer(this.historyPath);
  }

  async initialize(): Promise<void> {
    try {
      await mkdir(this.historyPath, { recursive: true });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize history directory: ${error.message}`);
      }
      throw error;
    }
  }

  async saveSnapshot(stats): Promise<void> {
    try {
      const historyFile = join(this.historyPath, 'history.json');
      let history = [];

      try {
        const data = await readFile(historyFile, 'utf8');
        history = JSON.parse(data);
      } catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
          throw error;
        }
      }

      const snapshot = {
        ...stats,
        timestamp: new Date().toISOString()
      };

      history.push(snapshot);

      // Keep only the latest entries
      if (history.length > this.maxEntries) {
        history = history.slice(-this.maxEntries);
      }

      await writeFile(historyFile, JSON.stringify(history, null, 2));

      // Check for alerts
      await this.checkForAlerts(snapshot, history);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save snapshot: ${error.message}`);
      }
      throw error;
    }
  }

  private async checkForAlerts(
    currentSnapshot,
    history
  ): Promise<void> {
    try {
      if (history.length < 2) return;

      const previousSnapshot = history[history.length - 2];
      const alerts = [];
      const thresholds = await this.getThresholds();

      // Check total size increase
      const totalSizeIncrease = (currentSnapshot.totalSize - previousSnapshot.totalSize) / previousSnapshot.totalSize * 100;
      if (totalSizeIncrease > thresholds.totalSizeIncreaseThreshold) {
        alerts.push({
          type: 'total-size-increase',
          severity: 'warning',
          message: `Total bundle size increased by ${totalSizeIncrease.toFixed(2)}%`,
          details: {
            timestamp: currentSnapshot.timestamp,
            previousValue: previousSnapshot.totalSize,
            currentValue: currentSnapshot.totalSize,
            threshold: thresholds.totalSizeIncreaseThreshold,
            percentageChange: totalSizeIncrease
          }
        });
      }

      // Check individual chunk size increases
      for (const currentChunk of currentSnapshot.chunks) {
        const previousChunk = previousSnapshot.chunks.find(c => c.name === currentChunk.name);
        if (previousChunk) {
          const chunkSizeIncrease = (currentChunk.size - previousChunk.size) / previousChunk.size * 100;
          if (chunkSizeIncrease > thresholds.chunkSizeIncreaseThreshold) {
            alerts.push({
              type: 'chunk-size-increase',
              severity: 'warning',
              message: `Chunk "${currentChunk.name}" size increased by ${chunkSizeIncrease.toFixed(2)}%`,
              details: {
                timestamp: currentSnapshot.timestamp,
                previousValue: previousChunk.size,
                currentValue: currentChunk.size,
                threshold: thresholds.chunkSizeIncreaseThreshold,
                percentageChange: chunkSizeIncrease,
                chunkName: currentChunk.name
              }
            });
          }
        }
      }

      // Check max size thresholds
      if (currentSnapshot.totalSize > thresholds.maxTotalSize) {
        alerts.push({
          type: 'max-size-exceeded',
          severity: 'error',
          message: `Total bundle size (${currentSnapshot.totalSize}) exceeds maximum allowed size (${thresholds.maxTotalSize})`,
          details: {
            timestamp: currentSnapshot.timestamp,
            currentValue: currentSnapshot.totalSize,
            threshold: thresholds.maxTotalSize
          }
        });
      }

      // Save alerts
      if (alerts.length > 0) {
        const alertsFile = join(this.historyPath, 'alerts.json');
        let existingAlerts = [];
        
        try {
          const data = await readFile(alertsFile, 'utf8');
          existingAlerts = JSON.parse(data);
        } catch (error) {
          if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
            throw error;
          }
        }

        existingAlerts.push(...alerts);
        await writeFile(alertsFile, JSON.stringify(existingAlerts, null, 2));
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check for alerts: ${error.message}`);
      }
      throw error;
    }
  }

  async getAlerts(): Promise<any[]> {
    try {
      const alertsFile = join(this.historyPath, 'alerts.json');
      const data = await readFile(alertsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to get alerts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async setThresholds(thresholds): Promise<void> {
    try {
      const currentThresholds = await this.getThresholds();
      const updatedThresholds = { ...currentThresholds, ...thresholds };
      const thresholdsFile = join(this.historyPath, 'thresholds.json');
      await writeFile(thresholdsFile, JSON.stringify(updatedThresholds, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to set thresholds: ${error.message}`);
      }
      throw error;
    }
  }

  async getThresholds(): Promise<any> {
    try {
      const thresholdsFile = join(this.historyPath, 'thresholds.json');
      const data = await readFile(thresholdsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Default thresholds
        return {
          totalSizeIncreaseThreshold: 10,    // 10%
          chunkSizeIncreaseThreshold: 15,    // 15%
          maxTotalSize: 5 * 1024 * 1024,     // 5MB
          maxChunkSize: 2 * 1024 * 1024      // 2MB
        };
      }
      throw new Error(`Failed to get thresholds: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async exportHistory(): Promise<any> {
    try {
      const [history, alerts, thresholds] = await Promise.all([
        this.getAllHistory(),
        this.getAlerts(),
        this.getThresholds()
      ]);

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        history,
        alerts,
        thresholds
      };

      return exportData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to export history: ${error.message}`);
      }
      throw error;
    }
  }

  async importHistory(data): Promise<any> {
    try {
      // Validate data structure
      if (!this.isValidExportData(data)) {
        return {
          success: false,
          message: 'Invalid export data format',
          entriesImported: 0,
          alerts: []
        };
      }

      // Write history
      const historyFile = join(this.historyPath, 'history.json');
      await writeFile(historyFile, JSON.stringify(data.history, null, 2));

      // Write alerts
      const alertsFile = join(this.historyPath, 'alerts.json');
      await writeFile(alertsFile, JSON.stringify(data.alerts, null, 2));

      // Write thresholds
      const thresholdsFile = join(this.historyPath, 'thresholds.json');
      await writeFile(thresholdsFile, JSON.stringify(data.thresholds, null, 2));

      return {
        success: true,
        message: 'Import successful',
        entriesImported: data.history.length,
        alerts: data.alerts
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: `Failed to import history: ${error.message}`,
          entriesImported: 0,
          alerts: []
        };
      }
      throw error;
    }
  }

  private isValidExportData(data): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const exportData = data;
    return (
      typeof exportData.version === 'string' &&
      typeof exportData.exportDate === 'string' &&
      Array.isArray(exportData.history) &&
      Array.isArray(exportData.alerts) &&
      typeof exportData.thresholds === 'object' &&
      typeof exportData.thresholds.totalSizeIncreaseThreshold === 'number' &&
      typeof exportData.thresholds.chunkSizeIncreaseThreshold === 'number' &&
      typeof exportData.thresholds.maxTotalSize === 'number' &&
      typeof exportData.thresholds.maxChunkSize === 'number'
    );
  }

  private async getAllHistory(): Promise<any[]> {
    try {
      const historyFile = join(this.historyPath, 'history.json');
      const data = await readFile(historyFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to get history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateReport(): Promise<string> {
    try {
      const history = await this.getAllHistory();
      return await this.visualizer.generateReport(history);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate report: ${error.message}`);
      }
      throw error;
    }
  }

  async queryHistory(query = {}): Promise<any> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      let history = JSON.parse(data);

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
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
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
      throw new Error(`Failed to query history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
