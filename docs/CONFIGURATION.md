# Configuration Guide

## Mục Lục
- [1. Cấu Hình Cơ Bản](#1-cấu-hình-cơ-bản)
- [2. Cấu Hình Bundle Size](#2-cấu-hình-bundle-size)
- [3. Cấu Hình AI](#3-cấu-hình-ai)
- [4. Cấu Hình History](#4-cấu-hình-history)
- [5. Cấu Hình RUM](#5-cấu-hình-rum)
- [6. Cấu Hình CI/CD](#6-cấu-hình-cicd)
- [7. Cấu Hình Nâng Cao](#7-cấu-hình-nâng-cao)

## 1. Cấu Hình Cơ Bản

### 1.1 File Cấu Hình

Tạo file `bundle-size-tracker.config.js` tại thư mục gốc:

```javascript
module.exports = {
  maxSize: 500,
  outputFormat: ['html', 'json'],
  outputPath: './reports',
  verbose: true,
  debug: false
};
```

### 1.2 Environment Variables

```bash
# .env
BUNDLE_ANALYZER_TOKEN=xxx
OPENAI_API_KEY=xxx
GITHUB_TOKEN=xxx
RUM_ENDPOINT=https://api.example.com/rum
```

### 1.3 TypeScript Configuration

```typescript
// bundle-size-tracker.config.ts
import type { BundleSizeTrackerConfig } from '@avixiii/bundle-size-tracker';

const config: BundleSizeTrackerConfig = {
  maxSize: 500,
  outputFormat: ['html', 'json'],
  outputPath: './reports'
};

export default config;
```

## 2. Cấu Hình Bundle Size

### 2.1 Giới Hạn Kích Thước Tổng Quát

```javascript
{
  maxSize: 500, // 500KB
  warnThreshold: 450, // Cảnh báo khi đạt 450KB
  errorThreshold: 500, // Lỗi khi vượt 500KB
  ignorePattern: ['*.map', '*.txt']
}
```

### 2.2 Giới Hạn Theo Bundle

```javascript
{
  rules: [
    {
      pattern: 'vendor',
      maxSize: 800,
      warnThreshold: 700
    },
    {
      pattern: /main\..+\.js$/,
      maxSize: 200,
      warnThreshold: 180
    },
    {
      pattern: 'chunk-*',
      maxSize: 50,
      warnThreshold: 45
    }
  ]
}
```

### 2.3 Cấu Hình Nén

```javascript
{
  compression: {
    gzip: {
      enabled: true,
      level: 9 // 1-9
    },
    brotli: {
      enabled: true,
      quality: 11 // 0-11
    },
    raw: true,
    customCompression: {
      name: 'custom-compression',
      compress: (content) => Buffer.from(content)
    }
  }
}
```

## 3. Cấu Hình AI

### 3.1 OpenAI Integration

```javascript
{
  ai: {
    enabled: true,
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 1000,
    analysisTypes: [
      'codeSplitting',
      'treeShaking',
      'dependencies',
      'performance'
    ]
  }
}
```

### 3.2 Custom AI Provider

```javascript
{
  ai: {
    enabled: true,
    provider: 'custom',
    endpoint: 'https://api.custom-ai.com/analyze',
    headers: {
      'Authorization': `Bearer ${process.env.CUSTOM_AI_TOKEN}`
    },
    transformResponse: (response) => ({
      suggestions: response.data.recommendations
    })
  }
}
```

## 4. Cấu Hình History

### 4.1 Local Storage

```javascript
{
  history: {
    enabled: true,
    storage: 'file',
    maxEntries: 100,
    path: './bundle-history',
    format: 'json',
    compression: true,
    retention: '30d' // Giữ lại 30 ngày
  }
}
```

### 4.2 Database Storage

```javascript
{
  history: {
    enabled: true,
    storage: 'mongodb',
    url: process.env.MONGODB_URL,
    collection: 'bundle-history',
    indexes: [
      { field: 'timestamp', type: 'date' },
      { field: 'totalSize', type: 'number' }
    ],
    cleanupSchedule: '0 0 * * *' // Chạy cleanup hàng ngày
  }
}
```

### 4.3 Thresholds

```javascript
{
  history: {
    thresholds: {
      totalSizeIncreaseThreshold: {
        percentage: 10,
        absolute: 50 * 1024 // 50KB
      },
      chunkSizeIncreaseThreshold: {
        percentage: 15,
        absolute: 20 * 1024 // 20KB
      },
      maxTotalSize: 5 * 1024 * 1024, // 5MB
      maxChunkSize: 2 * 1024 * 1024, // 2MB
      customThresholds: [
        {
          metric: 'totalSize',
          condition: (value) => value > 1024 * 1024,
          message: 'Total size exceeds 1MB'
        }
      ]
    }
  }
}
```

## 5. Cấu Hình RUM

### 5.1 Data Collection

```javascript
{
  rum: {
    enabled: true,
    sampleRate: 0.1,
    endpoint: '/api/rum',
    batchSize: 10,
    flushInterval: 5000,
    retryAttempts: 3,
    timeout: 5000,
    excludePatterns: [
      '/api/*',
      '/static/*',
      '*.gif'
    ]
  }
}
```

### 5.2 Metrics Configuration

```javascript
{
  rum: {
    metrics: {
      core: {
        loadTime: true,
        fcp: true,
        lcp: true,
        fid: true,
        cls: true,
        tti: true,
        tbt: true
      },
      custom: {
        memoryUsage: {
          enabled: true,
          interval: 5000
        },
        resourceTiming: {
          enabled: true,
          resourceTypes: ['script', 'css', 'image']
        },
        errors: {
          enabled: true,
          ignorePatterns: ['ResizeObserver loop']
        }
      },
      calculated: [
        {
          name: 'customScore',
          calculate: (metrics) => 
            metrics.loadTime * 0.3 +
            metrics.fcp * 0.3 +
            metrics.lcp * 0.4
        }
      ]
    }
  }
}
```

### 5.3 Storage và Analytics

```javascript
{
  rum: {
    storage: {
      type: 'elasticsearch',
      node: 'http://localhost:9200',
      index: 'rum-metrics',
      pipeline: 'rum-pipeline',
      retention: '90d'
    },
    analytics: {
      realtime: {
        enabled: true,
        interval: 60000, // 1 phút
        metrics: ['loadTime', 'fcp', 'lcp']
      },
      aggregations: [
        {
          name: 'hourly_avg',
          interval: '1h',
          metrics: ['loadTime', 'fcp'],
          functions: ['avg', 'p95']
        }
      ],
      alerts: [
        {
          metric: 'lcp',
          condition: 'p95 > 2500',
          channels: ['slack', 'email']
        }
      ]
    }
  }
}
```

## 6. Cấu Hình CI/CD

### 6.1 GitHub Actions

```javascript
{
  ci: {
    enabled: true,
    provider: 'github',
    token: process.env.GITHUB_TOKEN,
    failOnError: true,
    commentOnPR: true,
    annotations: true,
    statusCheck: {
      name: 'Bundle Size',
      failureThreshold: 10, // Fail nếu tăng >10%
      successThreshold: 5   // Pass nếu tăng <5%
    }
  }
}
```

### 6.2 Custom CI Integration

```javascript
{
  ci: {
    enabled: true,
    provider: 'custom',
    onAnalysisComplete: async (result) => {
      await sendToCI({
        status: result.status,
        details: result.analysis,
        url: process.env.CI_URL
      });
    },
    artifacts: {
      enabled: true,
      path: './reports',
      retention: '30d'
    }
  }
}
```

## 7. Cấu Hình Nâng Cao

### 7.1 Custom Plugins

```javascript
{
  plugins: [
    {
      name: 'custom-analyzer',
      hooks: {
        beforeAnalysis: async (context) => {
          // Custom logic
        },
        afterAnalysis: async (result) => {
          // Custom logic
        }
      }
    }
  ]
}
```

### 7.2 Performance Tuning

```javascript
{
  performance: {
    workers: 4,
    cache: {
      enabled: true,
      directory: '.cache',
      maxSize: 100 * 1024 * 1024 // 100MB
    },
    compression: {
      parallel: true,
      minSize: 1024 // Chỉ nén files >1KB
    },
    analysis: {
      depth: 3,
      timeout: 30000
    }
  }
}
```

### 7.3 Logging và Debug

```javascript
{
  logging: {
    level: 'debug',
    format: 'json',
    destination: ['console', 'file'],
    file: {
      path: './logs',
      maxSize: '10m',
      maxFiles: 5
    },
    filters: {
      exclude: ['debug', 'trace']
    }
  },
  debug: {
    enabled: true,
    saveArtifacts: true,
    verboseOutput: true,
    timings: true
  }
}
```

### 7.4 Security

```javascript
{
  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      key: process.env.ENCRYPTION_KEY
    },
    api: {
      authentication: {
        type: 'jwt',
        secret: process.env.JWT_SECRET
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 phút
        max: 100 // requests
      }
    }
  }
}
```

## Environment Variables Reference

```bash
# Core
BUNDLE_ANALYZER_TOKEN=xxx
NODE_ENV=production

# AI
OPENAI_API_KEY=xxx
AI_MODEL=gpt-3.5-turbo

# Storage
MONGODB_URL=mongodb://localhost:27017
ELASTICSEARCH_URL=http://localhost:9200

# CI/CD
GITHUB_TOKEN=xxx
CI_URL=https://ci.example.com

# RUM
RUM_ENDPOINT=https://api.example.com/rum
RUM_API_KEY=xxx

# Security
ENCRYPTION_KEY=xxx
JWT_SECRET=xxx
```

## Validation Schema

```typescript
// config.schema.ts
import { z } from 'zod';

export const configSchema = z.object({
  maxSize: z.number().positive(),
  outputFormat: z.array(z.enum(['html', 'json', 'console'])),
  outputPath: z.string(),
  // ... thêm các trường khác
});
```
