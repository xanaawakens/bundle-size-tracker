import type { RUMData, RUMConfig, RUMMetrics } from '../../types/rum';

export class RUMCollector {
  private config: RUMConfig;
  private metrics: Partial<RUMMetrics>;
  private observer: PerformanceObserver | null;

  constructor(config: RUMConfig) {
    this.config = config;
    this.metrics = {};
    this.observer = null;
    
    if (typeof window !== 'undefined' && config.enabled) {
      this.initializeObserver();
      this.initializeMetrics();
    }
  }

  private initializeObserver(): void {
    if (!PerformanceObserver) return;

    this.observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          this.metrics.largestContentfulPaint = entry.startTime;
        } else if (entry.entryType === 'first-input') {
          this.metrics.firstInputDelay = entry.processingStart! - entry.startTime;
        } else if (entry.entryType === 'layout-shift') {
          this.metrics.cumulativeLayoutShift = (this.metrics.cumulativeLayoutShift || 0) + (entry as any).value;
        }
      });
    });

    try {
      this.observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.error('Failed to initialize PerformanceObserver:', error);
    }
  }

  private initializeMetrics(): void {
    // Basic timing metrics
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.loadTime = navigation.loadEventEnd - navigation.startTime;
      
      // First Contentful Paint
      const paint = performance.getEntriesByType('paint')
        .find(entry => entry.name === 'first-contentful-paint');
      if (paint) {
        this.metrics.firstContentfulPaint = paint.startTime;
      }

      // Time to Interactive (approximation)
      const timeToInteractive = performance.timing.domInteractive - performance.timing.navigationStart;
      this.metrics.timeToInteractive = timeToInteractive;

      // Total Blocking Time (approximation)
      const tbt = performance.timing.domContentLoadedEventEnd - performance.timing.domContentLoadedEventStart;
      this.metrics.totalBlockingTime = tbt;

      this.collectAndSendMetrics();
    });
  }

  private async collectAndSendMetrics(): Promise<void> {
    if (!this.shouldCollectData()) return;

    const rumData: RUMData = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics as RUMMetrics,
      connection: this.getConnectionInfo(),
      deviceInfo: this.getDeviceInfo()
    };

    if (this.config.endpoint) {
      try {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rumData),
        });
      } catch (error) {
        console.error('Failed to send RUM data:', error);
      }
    }

    // Clean up observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private shouldCollectData(): boolean {
    if (!this.config.enabled) return false;
    if (this.config.excludePatterns?.some(pattern => 
      new RegExp(pattern).test(window.location.href)
    )) {
      return false;
    }
    return Math.random() < (this.config.sampleRate || 1);
  }

  private getConnectionInfo() {
    const connection = (navigator as any).connection;
    if (!connection) return undefined;

    return {
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      downlink: connection.downlink,
    };
  }

  private getDeviceInfo() {
    return {
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceType: this.getDeviceType(),
    };
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }
}
