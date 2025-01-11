import { BundleSizeHistory } from '../plugins/history';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('BundleSizeHistory', () => {
  let history: BundleSizeHistory;
  let testDir: string;
  let historyFile: string;
  let alertsFile: string;

  beforeEach(async () => {
    // Create temp directory for tests
    testDir = join(tmpdir(), `bundle-size-history-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    
    history = new BundleSizeHistory({
      historyDir: testDir,
      maxEntries: 100
    });
    await history.initialize();

    historyFile = join(testDir, 'history.json');
    alertsFile = join(testDir, 'alerts.json');

    // Create empty history and alerts files
    await writeFile(historyFile, '[]', 'utf8');
    await writeFile(alertsFile, '[]', 'utf8');
  });

  afterEach(async () => {
    try {
      // Cleanup temp directory after each test
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  });

  describe('queryHistory', () => {
    it('should return all entries when no filters are applied', async () => {
      const result = await history.queryHistory();
      expect(result.entries).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter by date range', async () => {
      const result = await history.queryHistory({
        startDate: new Date('2024-01-02T00:00:00Z'),
        endDate: new Date('2024-01-03T00:00:00Z')
      });
      expect(result.entries).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter by size range', async () => {
      const result = await history.queryHistory({
        minSize: 1000000,
        maxSize: 1100000
      });
      expect(result.entries).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter by chunk name', async () => {
      const result = await history.queryHistory({
        chunkNames: ['main']
      });
      expect(result.entries).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should sort entries correctly', async () => {
      const result = await history.queryHistory({
        sortBy: 'totalSize',
        sortOrder: 'desc'
      });
      expect(result.entries).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should paginate results', async () => {
      const result = await history.queryHistory({
        limit: 2,
        offset: 1
      });
      expect(result.entries).toHaveLength(0);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.offset).toBe(1);
    });

    it('should include correct summary statistics', async () => {
      const result = await history.queryHistory();
      expect(result.summary).toEqual({
        averageSize: 0,
        minSize: 0,
        maxSize: 0,
        totalEntries: 0
      });
    });
  });

  describe('getChunkNames', () => {
    it('should return all unique chunk names', async () => {
      const chunkNames = await history.getChunkNames();
      expect(chunkNames).toEqual([]);
    });
  });

  describe('getDateRange', () => {
    it('should return correct date range', async () => {
      const range = await history.getDateRange();
      expect(range.earliest).toBeNull();
      expect(range.latest).toBeNull();
    });
  });

  describe('getSizeRange', () => {
    it('should return correct size statistics', async () => {
      const stats = await history.getSizeRange();
      expect(stats).toEqual({
        min: 0,
        max: 0,
        average: 0
      });
    });
  });

  describe('visualization', () => {
    it('should generate report file', async () => {
      const reportPath = await history.generateReport();
      expect(reportPath).toContain('bundle-report.html');
    });
  });

  describe('alerts', () => {
    beforeEach(async () => {
      // Create initial state with one entry
      const initialData = [{
        timestamp: '2024-01-03T00:00:00Z',
        totalSize: 900000,
        gzipSize: 280000,
        brotliSize: 240000,
        chunks: [
          { name: 'main', size: 500000, modules: [] },
          { name: 'vendor', size: 400000, modules: [] }
        ]
      }];
      await writeFile(historyFile, JSON.stringify(initialData), 'utf8');
    });

    it('should generate alert for total size increase', async () => {
      await history.saveSnapshot({
        totalSize: 1200000, // 33% increase
        gzipSize: 360000,
        brotliSize: 300000,
        chunks: [
          { name: 'main', size: 700000, modules: [] },
          { name: 'vendor', size: 500000, modules: [] }
        ]
      });

      const alerts = await history.getAlerts();
      expect(alerts).toHaveLength(3); // Total size + both chunks increased
      const totalSizeAlert = alerts.find(a => a.type === 'total-size-increase');
      expect(totalSizeAlert).toBeDefined();
      expect(totalSizeAlert!.severity).toBe('warning');
    });

    it('should generate alert for chunk size increase', async () => {
      await history.saveSnapshot({
        totalSize: 1100000,
        gzipSize: 330000,
        brotliSize: 275000,
        chunks: [
          { name: 'main', size: 500000, modules: [] },
          { name: 'vendor', size: 600000, modules: [] } // 50% increase
        ]
      });

      const alerts = await history.getAlerts();
      const chunkAlert = alerts.find(a => 
        a.type === 'chunk-size-increase' && a.details.chunkName === 'vendor'
      );
      expect(chunkAlert).toBeDefined();
      expect(chunkAlert!.details.percentageChange).toBeGreaterThan(15);
    });

    it('should generate alert for exceeding max size', async () => {
      await history.setThresholds({
        maxTotalSize: 1000000 // 1MB
      });

      await history.saveSnapshot({
        totalSize: 1500000, // Exceeds max
        gzipSize: 450000,
        brotliSize: 375000,
        chunks: [
          { name: 'main', size: 900000, modules: [] },
          { name: 'vendor', size: 600000, modules: [] }
        ]
      });

      const alerts = await history.getAlerts();
      const sizeAlert = alerts.find(a => a.type === 'max-size-exceeded');
      expect(sizeAlert).toBeDefined();
      expect(sizeAlert!.severity).toBe('error');
    });
  });

  describe('export/import', () => {
    it('should export history data', async () => {
      // Add some data
      await history.saveSnapshot({
        totalSize: 1000000,
        gzipSize: 300000,
        brotliSize: 250000,
        chunks: [
          { name: 'main', size: 600000, modules: [] },
          { name: 'vendor', size: 400000, modules: [] }
        ]
      });

      const exportData = await history.exportHistory();
      expect(exportData.version).toBe('1.0.0');
      expect(exportData.history).toHaveLength(1);
      expect(exportData.thresholds).toBeDefined();
    });

    it('should import history data', async () => {
      const importData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        history: [
          {
            timestamp: '2024-01-01T00:00:00Z',
            totalSize: 1000000,
            gzipSize: 300000,
            brotliSize: 250000,
            chunks: [
              { name: 'main', size: 600000, modules: [] },
              { name: 'vendor', size: 400000, modules: [] }
            ]
          }
        ],
        alerts: [],
        thresholds: {
          totalSizeIncreaseThreshold: 5,
          chunkSizeIncreaseThreshold: 10,
          maxTotalSize: 2000000,
          maxChunkSize: 1000000
        }
      };

      const result = await history.importHistory(importData);
      expect(result.success).toBe(true);
      expect(result.entriesImported).toBe(1);

      // Verify imported data
      const exportData = await history.exportHistory();
      expect(exportData.history).toHaveLength(1);
      expect(exportData.thresholds.totalSizeIncreaseThreshold).toBe(5);
    });

    it('should handle invalid import data', async () => {
      const result = await history.importHistory({} as any);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid export data format');
    });
  });
});
