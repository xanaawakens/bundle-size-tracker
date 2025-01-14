# Hướng Dẫn Sử Dụng Chi Tiết Bundle Size Tracker

## Mục Lục
- [1. Cài Đặt và Cấu Hình Cơ Bản](#1-cài-đặt-và-cấu-hình-cơ-bản)
- [2. Theo Dõi Kích Thước Bundle](#2-theo-dõi-kích-thước-bundle)
- [3. Tối Ưu Hóa với AI](#3-tối-ưu-hóa-với-ai)
- [4. Theo Dõi Lịch Sử và Cảnh Báo](#4-theo-dõi-lịch-sử-và-cảnh-báo)
- [5. Real User Monitoring (RUM)](#5-real-user-monitoring-rum)
- [6. Tích Hợp CI/CD](#6-tích-hợp-cicd)

## 1. Cài Đặt và Cấu Hình Cơ Bản

### 1.1 Cài Đặt

```bash
# NPM
npm install @avixiii/bundle-size-tracker --save-dev

# Yarn
yarn add -D @avixiii/bundle-size-tracker

# PNPM
pnpm add -D @avixiii/bundle-size-tracker
```

### 1.2 Cấu Hình Cơ Bản

#### Webpack
```javascript
// webpack.config.js
const { BundleSizeTrackerPlugin } = require('@avixiii/bundle-size-tracker');

module.exports = {
  plugins: [
    new BundleSizeTrackerPlugin({
      maxSize: 500, // Giới hạn 500KB
      outputFormat: 'html',
      outputPath: './reports'
    })
  ]
};
```

#### Rollup
```javascript
// rollup.config.js
import { bundleSizeTracker } from '@avixiii/bundle-size-tracker';

export default {
  plugins: [
    bundleSizeTracker({
      maxSize: 300,
      outputFormat: 'json'
    })
  ]
};
```

#### Vite
```javascript
// vite.config.js
import { bundleSizeTrackerVite } from '@avixiii/bundle-size-tracker';

export default {
  plugins: [
    bundleSizeTrackerVite({
      maxSize: 400
    })
  ]
};
```

## 2. Theo Dõi Kích Thước Bundle

### 2.1 Thiết Lập Giới Hạn Kích Thước

```javascript
{
  rules: [
    {
      pattern: 'vendor', // Hoặc regex: /vendor\..*\.js$/
      maxSize: 800 // 800KB cho vendor bundles
    },
    {
      pattern: 'main',
      maxSize: 200 // 200KB cho main bundle
    }
  ]
}
```

### 2.2 Cấu Hình Nén

```javascript
{
  compression: {
    gzip: true,    // Bật phân tích Gzip
    brotli: true,  // Bật phân tích Brotli
    raw: true      // Hiển thị kích thước gốc
  }
}
```

### 2.3 Định Dạng Báo Cáo

```javascript
{
  reportFormats: ['json', 'html', 'console'],
  outputPath: './reports',
  reportFilename: 'bundle-report-[date]'
}
```

## 3. Tối Ưu Hóa với AI

### 3.1 Kích Hoạt Phân Tích AI

```javascript
{
  ai: {
    enabled: true,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY
  }
}
```

### 3.2 Tùy Chỉnh Phân Tích

```javascript
{
  ai: {
    enabled: true,
    analysisTypes: [
      'codeSplitting',
      'treeShaking',
      'dependencies',
      'performance'
    ],
    customPrompt: 'Tập trung vào việc tối ưu thời gian tải'
  }
}
```

## 4. Theo Dõi Lịch Sử và Cảnh Báo

### 4.1 Cấu Hình Lịch Sử

```javascript
{
  history: {
    enabled: true,
    maxEntries: 100,
    exportPath: './bundle-history',
    storageType: 'file' // hoặc 'database'
  }
}
```

### 4.2 Thiết Lập Cảnh Báo

```javascript
{
  history: {
    thresholds: {
      totalSizeIncreaseThreshold: 10, // Cảnh báo khi tăng 10%
      chunkSizeIncreaseThreshold: 15, // Cảnh báo khi chunk tăng 15%
      maxTotalSize: 5 * 1024 * 1024,  // Giới hạn 5MB
      maxChunkSize: 2 * 1024 * 1024   // Giới hạn chunk 2MB
    }
  }
}
```

## 5. Real User Monitoring (RUM)

### 5.1 Cấu Hình Cơ Bản RUM

```javascript
{
  rum: {
    enabled: true,
    sampleRate: 0.1, // Thu thập 10% người dùng
    endpoint: '/api/rum'
  }
}
```

### 5.2 Tùy Chỉnh Thu Thập Dữ Liệu

```javascript
{
  rum: {
    excludePatterns: ['/api/*', '/static/*'],
    metrics: {
      loadTime: true,
      fcp: true,
      lcp: true,
      fid: true,
      cls: true,
      tti: true,
      tbt: true
    },
    customMetrics: {
      memoryUsage: true,
      networkInfo: true
    }
  }
}
```

### 5.3 Xử Lý Dữ Liệu RUM

```javascript
// server.js
app.post('/api/rum', (req, res) => {
  const rumData = req.body;
  // Lưu và phân tích dữ liệu RUM
  console.log('RUM Data:', {
    loadTime: rumData.metrics.loadTime,
    fcp: rumData.metrics.firstContentfulPaint,
    deviceType: rumData.deviceInfo.deviceType
  });
});
```

## 6. Tích Hợp CI/CD

### 6.1 GitHub Actions

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Build and analyze bundle
        run: npm run build
        env:
          BUNDLE_ANALYZER_TOKEN: ${{ secrets.BUNDLE_ANALYZER_TOKEN }}
      - name: Check bundle size
        run: npx bundle-size-tracker check
```

### 6.2 Cấu Hình CI Mode

```javascript
{
  ci: {
    enabled: true,
    failOnError: true,
    commentOnPR: true,
    githubToken: process.env.GITHUB_TOKEN,
    annotations: true
  }
}
```

## Ví Dụ Thực Tế

### Cấu Hình Đầy Đủ

```javascript
// webpack.config.js
const { BundleSizeTrackerPlugin } = require('@avixiii/bundle-size-tracker');

module.exports = {
  plugins: [
    new BundleSizeTrackerPlugin({
      // Cấu hình cơ bản
      maxSize: 500,
      outputFormat: ['html', 'json'],
      outputPath: './reports',

      // Quy tắc kích thước
      rules: [
        { pattern: 'vendor', maxSize: 800 },
        { pattern: 'main', maxSize: 200 }
      ],

      // Nén
      compression: {
        gzip: true,
        brotli: true,
        raw: true
      },

      // AI Analysis
      ai: {
        enabled: true,
        model: 'gpt-3.5-turbo',
        analysisTypes: ['codeSplitting', 'treeShaking']
      },

      // History tracking
      history: {
        enabled: true,
        maxEntries: 100,
        thresholds: {
          totalSizeIncreaseThreshold: 10,
          maxTotalSize: 5 * 1024 * 1024
        }
      },

      // RUM
      rum: {
        enabled: true,
        sampleRate: 0.1,
        endpoint: '/api/rum',
        excludePatterns: ['/api/*'],
        metrics: {
          loadTime: true,
          fcp: true,
          lcp: true
        }
      },

      // CI Integration
      ci: {
        enabled: true,
        failOnError: true,
        commentOnPR: true
      }
    })
  ]
};
```

## Xử Lý Sự Cố Thường Gặp

### 1. Bundle Size Quá Lớn
```javascript
// Tách code theo routes
{
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxSize: 244000
    }
  }
}
```

### 2. RUM Data Không Được Gửi
```javascript
// Kiểm tra endpoint và CORS
{
  rum: {
    endpoint: '/api/rum',
    retryAttempts: 3,
    timeout: 5000,
    debug: true
  }
}
```

### 3. CI Pipeline Fails
```javascript
// Tăng ngưỡng tạm thời cho CI
{
  ci: {
    thresholds: {
      warning: 10,  // Tăng ngưỡng cảnh báo
      error: 20     // Tăng ngưỡng lỗi
    }
  }
}
```

## Tài Liệu Tham Khảo

- [API Documentation](./API.md)
- [Configuration Guide](./CONFIGURATION.md)
- [Best Practices](./BEST_PRACTICES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Examples](./examples/)
