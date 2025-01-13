import { RealUserMonitoring } from '../plugins/rum';
import { RUMAnalyzer } from '../plugins/rum/analyzer';
import type { RUMData } from '../types/rum';

describe('Real User Monitoring', () => {
  const mockRUMData: RUMData[] = [
    {
      timestamp: Date.now(),
      url: 'https://example.com',
      userAgent: 'Mozilla/5.0',
      metrics: {
        loadTime: 2000,
        firstContentfulPaint: 1000,
        largestContentfulPaint: 2500,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.1,
        timeToInteractive: 3000,
        totalBlockingTime: 500
      },
      deviceInfo: {
        deviceType: 'desktop',
        hardwareConcurrency: 8
      },
      connection: {
        effectiveType: '4g',
        rtt: 50,
        downlink: 10
      }
    },
    {
      timestamp: Date.now(),
      url: 'https://example.com',
      userAgent: 'Mozilla/5.0',
      metrics: {
        loadTime: 4000,
        firstContentfulPaint: 2000,
        largestContentfulPaint: 3500,
        firstInputDelay: 150,
        cumulativeLayoutShift: 0.2,
        timeToInteractive: 4500,
        totalBlockingTime: 1000
      },
      deviceInfo: {
        deviceType: 'mobile',
        hardwareConcurrency: 4
      },
      connection: {
        effectiveType: '3g',
        rtt: 100,
        downlink: 5
      }
    }
  ];

  describe('RUMAnalyzer', () => {
    let analyzer: RUMAnalyzer;

    beforeEach(() => {
      analyzer = new RUMAnalyzer(mockRUMData);
    });

    test('should analyze metrics correctly', () => {
      const analysis = analyzer.analyze();

      expect(analysis.totalSamples).toBe(2);
      expect(analysis.deviceBreakdown).toEqual({
        desktop: 1,
        mobile: 1,
        tablet: 0
      });

      // Check metrics calculations
      expect(analysis.metrics.loadTime.median).toBe(2000); // First value in sorted array [2000, 4000]
      expect(analysis.metrics.firstContentfulPaint.median).toBe(1000); // First value in sorted array [1000, 2000]
      expect(analysis.connectionTypes).toEqual({
        '3g': 1,
        '4g': 1
      });
    });

    test('should generate recommendations', () => {
      const recommendations = analyzer.getRecommendations();
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('RealUserMonitoring', () => {
    let rum: RealUserMonitoring;

    beforeEach(() => {
      rum = new RealUserMonitoring({
        enabled: true,
        sampleRate: 1
      });
    });

    test('should initialize with config', () => {
      expect(rum).toBeInstanceOf(RealUserMonitoring);
    });

    test('should add and analyze data', async () => {
      mockRUMData.forEach(data => rum.addData(data));
      const recommendations = await rum.analyze();
      
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    test('should clear data', () => {
      mockRUMData.forEach(data => rum.addData(data));
      rum.clearData();
      const analysis = rum.getMetricsAnalysis();
      expect(analysis.totalSamples).toBe(0);
    });
  });
});
