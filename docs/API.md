# API Documentation

## Core API

### BundleSizeTrackerPlugin

#### Constructor Options

```typescript
interface BundleSizeTrackerOptions {
  // Core Options
  maxSize?: number;                 // Maximum bundle size in KB
  outputFormat?: OutputFormat[];    // 'json' | 'html' | 'console'
  outputPath?: string;              // Output directory for reports
  
  // Rules Configuration
  rules?: {
    pattern: string | RegExp;       // Bundle name pattern
    maxSize: number;                // Size limit in KB
  }[];
  
  // Compression Options
  compression?: {
    gzip?: boolean;                 // Enable Gzip analysis
    brotli?: boolean;               // Enable Brotli analysis
    raw?: boolean;                  // Show raw size
  };
  
  // AI Configuration
  ai?: {
    enabled?: boolean;              // Enable AI analysis
    model?: string;                 // AI model to use
    temperature?: number;           // Model temperature
    apiKey?: string;               // OpenAI API key
  };
  
  // History Configuration
  history?: {
    enabled?: boolean;              // Enable history tracking
    maxEntries?: number;            // Maximum history entries
    exportPath?: string;            // History export path
    thresholds?: {
      totalSizeIncreaseThreshold?: number;
      chunkSizeIncreaseThreshold?: number;
      maxTotalSize?: number;
      maxChunkSize?: number;
    };
  };
  
  // RUM Configuration
  rum?: {
    enabled?: boolean;              // Enable RUM
    sampleRate?: number;            // Sampling rate (0-1)
    endpoint?: string;              // Data collection endpoint
    excludePatterns?: string[];     // URL patterns to exclude
    metrics?: {                     // Metrics to collect
      loadTime?: boolean;
      fcp?: boolean;
      lcp?: boolean;
      fid?: boolean;
      cls?: boolean;
      tti?: boolean;
      tbt?: boolean;
    };
  };
  
  // CI Configuration
  ci?: {
    enabled?: boolean;              // Enable CI mode
    failOnError?: boolean;          // Fail CI on size limit exceed
    commentOnPR?: boolean;          // Comment on GitHub PR
    annotations?: boolean;          // Add GitHub annotations
  };
}
```

### Methods

#### analyze()
Analyzes bundle sizes and generates reports.

```typescript
async analyze(): Promise<AnalysisResult> {
  return {
    totalSize: number;
    bundles: Bundle[];
    status: 'pass' | 'fail';
    recommendations: string[];
  };
}
```

#### getHistory()
Retrieves bundle size history.

```typescript
async getHistory(): Promise<HistoryEntry[]> {
  return [
    {
      timestamp: string;
      totalSize: number;
      bundles: Bundle[];
      changes: Changes;
    }
  ];
}
```

#### getRUMData()
Retrieves Real User Monitoring data.

```typescript
async getRUMData(): Promise<RUMData[]> {
  return [
    {
      timestamp: string;
      metrics: RUMMetrics;
      deviceInfo: DeviceInfo;
      connection: ConnectionInfo;
    }
  ];
}
```

## Types

### Bundle
```typescript
interface Bundle {
  name: string;
  size: number;
  compressed: {
    gzip?: number;
    brotli?: number;
  };
  modules: Module[];
}
```

### RUMMetrics
```typescript
interface RUMMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}
```

### DeviceInfo
```typescript
interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  hardwareConcurrency: number;
  deviceMemory?: number;
}
```

### ConnectionInfo
```typescript
interface ConnectionInfo {
  effectiveType: string;
  rtt: number;
  downlink: number;
}
```

## Events

### onAnalysisComplete
Fired when bundle analysis is complete.

```typescript
onAnalysisComplete(callback: (result: AnalysisResult) => void): void;
```

### onSizeExceeded
Fired when bundle size exceeds limit.

```typescript
onSizeExceeded(callback: (bundle: Bundle) => void): void;
```

### onRUMDataCollected
Fired when RUM data is collected.

```typescript
onRUMDataCollected(callback: (data: RUMData) => void): void;
```

## CLI Commands

### Check Bundle Size
```bash
npx bundle-size-tracker check
```

### Generate Report
```bash
npx bundle-size-tracker report --format html
```

### View History
```bash
npx bundle-size-tracker history --last 10
```

### Export RUM Data
```bash
npx bundle-size-tracker rum-export --format json
```

## Error Handling

### Error Types
```typescript
enum BundleSizeError {
  SIZE_LIMIT_EXCEEDED = 'SIZE_LIMIT_EXCEEDED',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  RUM_DATA_COLLECTION_FAILED = 'RUM_DATA_COLLECTION_FAILED'
}
```

### Error Handling Example
```typescript
try {
  await analyzer.analyze();
} catch (error) {
  if (error.code === BundleSizeError.SIZE_LIMIT_EXCEEDED) {
    console.error(`Bundle size exceeded: ${error.bundle.name}`);
  }
}
```

## Middleware

### Express Middleware
```typescript
import { rumMiddleware } from '@avixiii/bundle-size-tracker/middleware';

app.use('/api/rum', rumMiddleware({
  storage: 'mongodb',
  url: process.env.MONGODB_URL
}));
```

### Custom Storage Adapter
```typescript
interface StorageAdapter {
  save(data: RUMData): Promise<void>;
  get(query: Query): Promise<RUMData[]>;
  clear(): Promise<void>;
}

class CustomStorage implements StorageAdapter {
  // Implement storage methods
}
```
