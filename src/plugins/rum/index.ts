/// <reference types="@types/web" />

import { RUMCollector } from './collector';
import { RUMAnalyzer } from './analyzer';
import type { RUMConfig, RUMData } from '../../types/rum';

export class RealUserMonitoring {
  private collector: RUMCollector;
  private data: RUMData[];
  private config: RUMConfig;

  constructor(config: Partial<RUMConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1,
      ...config
    };
    this.collector = new RUMCollector(this.config);
    this.data = [];
  }

  public initialize(): void {
    if (typeof window === 'undefined') {
      console.warn('RUM initialization failed: window object not available');
      return;
    }

    // Initialize collector
    this.collector = new RUMCollector(this.config);
  }

  public async analyze(): Promise<string[]> {
    const analyzer = new RUMAnalyzer(this.data);
    return analyzer.getRecommendations();
  }

  public getMetricsAnalysis() {
    const analyzer = new RUMAnalyzer(this.data);
    return analyzer.analyze();
  }

  public addData(data: RUMData): void {
    this.data.push(data);
  }

  public clearData(): void {
    this.data = [];
  }
}

// Export types
export type { RUMConfig, RUMData, RUMMetrics } from '../../types/rum';
export type { PerformanceMetrics, RUMAnalysis } from './analyzer';
