import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { BundleStats, HistoryOptions, TrendAnalysis } from '../../types/history';
import { BundleVisualizer } from './visualization';

export class BundleSizeHistory {
  private historyPath: string;
  private options: HistoryOptions;
  private visualizer: BundleVisualizer;

  constructor(options: HistoryOptions) {
    this.options = {
      historyDir: '.bundle-size-history',
      maxEntries: 100,
      ...options
    };
    this.historyPath = join(process.cwd(), this.options.historyDir);
    this.visualizer = new BundleVisualizer(this.historyPath);
  }

  async initialize(): Promise<void> {
    try {
      await mkdir(this.historyPath, { recursive: true });
    } catch (error) {
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
    } catch (error) {
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
      const averageSize = history.reduce((sum, entry) => sum + entry.totalSize, 0) / history.length;

      // Determine trend and generate recommendations
      const trend = this.determineTrend(percentageChange);
      const recommendations = this.generateRecommendations(trend, percentageChange, history);

      return {
        trend,
        percentageChange,
        averageSize,
        recommendations
      };
    } catch (error) {
      throw new Error(`Failed to analyze trends: ${error.message}`);
    }
  }

  async generateReport(): Promise<string> {
    const historyFile = join(this.historyPath, 'history.json');
    
    try {
      const data = await readFile(historyFile, 'utf8');
      const history = JSON.parse(data);
      return await this.visualizer.generateReport(history);
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
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
