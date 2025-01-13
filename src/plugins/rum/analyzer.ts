import type { RUMData } from '../../types/rum';

export interface PerformanceMetrics {
  median: number;
  p75: number;
  p95: number;
  p99: number;
}

export interface RUMAnalysis {
  totalSamples: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  metrics: {
    loadTime: PerformanceMetrics;
    firstContentfulPaint: PerformanceMetrics;
    largestContentfulPaint: PerformanceMetrics;
    firstInputDelay: PerformanceMetrics;
    cumulativeLayoutShift: PerformanceMetrics;
    timeToInteractive: PerformanceMetrics;
    totalBlockingTime: PerformanceMetrics;
  };
  connectionTypes: {
    [key: string]: number;
  };
}

export class RUMAnalyzer {
  private data: RUMData[];

  constructor(data: RUMData[]) {
    this.data = data;
  }

  public analyze(): RUMAnalysis {
    return {
      totalSamples: this.data.length,
      deviceBreakdown: this.analyzeDeviceBreakdown(),
      metrics: {
        loadTime: this.analyzeMetric('loadTime'),
        firstContentfulPaint: this.analyzeMetric('firstContentfulPaint'),
        largestContentfulPaint: this.analyzeMetric('largestContentfulPaint'),
        firstInputDelay: this.analyzeMetric('firstInputDelay'),
        cumulativeLayoutShift: this.analyzeMetric('cumulativeLayoutShift'),
        timeToInteractive: this.analyzeMetric('timeToInteractive'),
        totalBlockingTime: this.analyzeMetric('totalBlockingTime'),
      },
      connectionTypes: this.analyzeConnectionTypes(),
    };
  }

  private analyzeDeviceBreakdown(): { mobile: number; tablet: number; desktop: number } {
    const breakdown = { mobile: 0, tablet: 0, desktop: 0 };
    this.data.forEach(entry => {
      if (entry.deviceInfo?.deviceType) {
        breakdown[entry.deviceInfo.deviceType as keyof typeof breakdown]++;
      }
    });
    return breakdown;
  }

  private analyzeMetric(metricName: keyof RUMData['metrics']): PerformanceMetrics {
    const values = this.data
      .map(entry => entry.metrics[metricName])
      .filter(value => typeof value === 'number')
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return { median: 0, p75: 0, p95: 0, p99: 0 };
    }

    return {
      median: this.getPercentile(values, 50),
      p75: this.getPercentile(values, 75),
      p95: this.getPercentile(values, 95),
      p99: this.getPercentile(values, 99),
    };
  }

  private analyzeConnectionTypes(): { [key: string]: number } {
    const types: { [key: string]: number } = {};
    this.data.forEach(entry => {
      if (entry.connection?.effectiveType) {
        types[entry.connection.effectiveType] = (types[entry.connection.effectiveType] || 0) + 1;
      }
    });
    return types;
  }

  private getPercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
  }

  public getRecommendations(): string[] {
    const recommendations: string[] = [];
    const analysis = this.analyze();

    // Load Time recommendations
    if (analysis.metrics.loadTime.p75 > 3000) {
      recommendations.push('Consider optimizing page load time - 75th percentile is above 3 seconds');
    }

    // LCP recommendations
    if (analysis.metrics.largestContentfulPaint.p75 > 2500) {
      recommendations.push('Largest Contentful Paint needs improvement - consider optimizing main content loading');
    }

    // FID recommendations
    if (analysis.metrics.firstInputDelay.p75 > 100) {
      recommendations.push('First Input Delay is high - consider optimizing JavaScript execution');
    }

    // CLS recommendations
    if (analysis.metrics.cumulativeLayoutShift.p75 > 0.1) {
      recommendations.push('Cumulative Layout Shift is high - review layout stability');
    }

    // Device-specific recommendations
    const mobilePercentage = (analysis.deviceBreakdown.mobile / analysis.totalSamples) * 100;
    if (mobilePercentage > 50 && analysis.metrics.loadTime.p75 > 2000) {
      recommendations.push('High mobile usage detected with slow load times - consider mobile optimization');
    }

    // Connection-type recommendations
    const slow2gAnd3g = (analysis.connectionTypes['2g'] || 0) + (analysis.connectionTypes['3g'] || 0);
    const slowConnectionPercentage = (slow2gAnd3g / analysis.totalSamples) * 100;
    if (slowConnectionPercentage > 20) {
      recommendations.push('Significant slow network usage detected - consider implementing progressive loading');
    }

    return recommendations;
  }
}
