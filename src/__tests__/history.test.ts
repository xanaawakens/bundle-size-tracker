import { BundleSizeHistory } from '../plugins/history';
import { BundleStats } from '../types/history';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('BundleSizeHistory', () => {
  let history: BundleSizeHistory;
  let testDir: string;
  let historyFile: string;

  beforeEach(async () => {
    // Create temp directory for tests
    testDir = join(tmpdir(), `bundle-size-history-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    
    history = new BundleSizeHistory({
      historyDir: testDir,
      maxEntries: 100
    });
    await history.initialize();

    // Create sample data
    const sampleData = [
      {
        timestamp: '2024-01-01T00:00:00Z',
        totalSize: 1000000,
        gzipSize: 300000,
        brotliSize: 250000,
        chunks: [
          { name: 'main', size: 600000, modules: [] },
          { name: 'vendor', size: 400000, modules: [] }
        ]
      },
      {
        timestamp: '2024-01-02T00:00:00Z',
        totalSize: 1200000,
        gzipSize: 350000,
        brotliSize: 300000,
        chunks: [
          { name: 'main', size: 700000, modules: [] },
          { name: 'vendor', size: 500000, modules: [] }
        ]
      },
      {
        timestamp: '2024-01-03T00:00:00Z',
        totalSize: 900000,
        gzipSize: 280000,
        brotliSize: 240000,
        chunks: [
          { name: 'main', size: 500000, modules: [] },
          { name: 'vendor', size: 400000, modules: [] }
        ]
      }
    ];

    historyFile = join(testDir, 'history.json');
    await writeFile(historyFile, JSON.stringify(sampleData), 'utf8');
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
      expect(result.entries).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by date range', async () => {
      const result = await history.queryHistory({
        startDate: new Date('2024-01-02T00:00:00Z'),
        endDate: new Date('2024-01-03T00:00:00Z')
      });
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].timestamp).toBe('2024-01-03T00:00:00Z');
    });

    it('should filter by size range', async () => {
      const result = await history.queryHistory({
        minSize: 1000000,
        maxSize: 1100000
      });
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].totalSize).toBe(1000000);
    });

    it('should filter by chunk name', async () => {
      const result = await history.queryHistory({
        chunkNames: ['main']
      });
      expect(result.entries).toHaveLength(3);
      expect(result.entries[0].chunks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'main' })
        ])
      );
    });

    it('should sort entries correctly', async () => {
      const result = await history.queryHistory({
        sortBy: 'totalSize',
        sortOrder: 'desc'
      });
      expect(result.entries[0].totalSize).toBe(1200000);
      expect(result.entries[2].totalSize).toBe(900000);
    });

    it('should paginate results', async () => {
      const result = await history.queryHistory({
        limit: 2,
        offset: 1
      });
      expect(result.entries).toHaveLength(2);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.offset).toBe(1);
    });

    it('should include correct summary statistics', async () => {
      const result = await history.queryHistory();
      expect(result.summary).toEqual({
        averageSize: (1000000 + 1200000 + 900000) / 3,
        minSize: 900000,
        maxSize: 1200000,
        totalEntries: 3
      });
    });
  });

  describe('getChunkNames', () => {
    it('should return all unique chunk names', async () => {
      const chunkNames = await history.getChunkNames();
      expect(chunkNames).toEqual(['main', 'vendor']);
    });
  });

  describe('getDateRange', () => {
    it('should return correct date range', async () => {
      const range = await history.getDateRange();
      expect(range.earliest).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(range.latest).toEqual(new Date('2024-01-03T00:00:00Z'));
    });
  });

  describe('getSizeRange', () => {
    it('should return correct size statistics', async () => {
      const stats = await history.getSizeRange();
      expect(stats).toEqual({
        min: 900000,
        max: 1200000,
        average: (1000000 + 1200000 + 900000) / 3
      });
    });
  });

  describe('visualization', () => {
    it('should generate report file', async () => {
      const reportPath = await history.generateReport();
      expect(reportPath).toContain('bundle-report.html');
    });
  });
});
