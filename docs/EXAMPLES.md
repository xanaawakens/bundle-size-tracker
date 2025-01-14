# Examples - Use Cases Phổ Biến

## Mục Lục
- [1. Theo Dõi Bundle Size Cơ Bản](#1-theo-dõi-bundle-size-cơ-bản)
- [2. Tối Ưu Hóa Bundle Size](#2-tối-ưu-hóa-bundle-size)
- [3. Giám Sát Performance](#3-giám-sát-performance)
- [4. CI/CD Integration](#4-cicd-integration)
- [5. Custom Analytics](#5-custom-analytics)

## 1. Theo Dõi Bundle Size Cơ Bản

### 1.1 React App với Webpack

```javascript
// webpack.config.js
const { BundleSizeTrackerPlugin } = require('@avixiii/bundle-size-tracker');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  plugins: [
    new BundleSizeTrackerPlugin({
      maxSize: 500, // 500KB
      outputFormat: ['html', 'json'],
      outputPath: './reports',
      rules: [
        { pattern: 'vendor', maxSize: 300 },
        { pattern: 'main', maxSize: 200 }
      ]
    })
  ]
};
```

### 1.2 Vue App với Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { bundleSizeTrackerVite } from '@avixiii/bundle-size-tracker';

export default defineConfig({
  plugins: [
    vue(),
    bundleSizeTrackerVite({
      maxSize: 400,
      rules: [
        { pattern: 'vendor', maxSize: 250 },
        { pattern: 'app', maxSize: 150 }
      ],
      compression: {
        gzip: true,
        brotli: true
      }
    })
  ]
});
```

### 1.3 Next.js App

```javascript
// next.config.js
const { withBundleSizeTracker } = require('@avixiii/bundle-size-tracker/next');

module.exports = withBundleSizeTracker({
  maxSize: 600,
  rules: [
    { pattern: 'pages/*', maxSize: 100 },
    { pattern: 'shared/*', maxSize: 200 }
  ],
  outputFormat: ['html'],
  outputPath: './bundle-reports'
})({
  // Next.js config
});
```

## 2. Tối Ưu Hóa Bundle Size

### 2.1 Code Splitting Tự Động

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new BundleSizeTrackerPlugin({
      maxSize: 500,
      ai: {
        enabled: true,
        analysisTypes: ['codeSplitting'],
        autoOptimize: true
      },
      optimization: {
        splitChunks: {
          chunks: 'all',
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all'
            }
          }
        }
      }
    })
  ]
};
```

### 2.2 Tree Shaking Nâng Cao

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new BundleSizeTrackerPlugin({
      maxSize: 500,
      ai: {
        enabled: true,
        analysisTypes: ['treeShaking']
      },
      treeShaking: {
        modules: true,
        dynamicImports: true,
        sideEffects: true,
        unusedExports: true
      }
    })
  ]
};
```

### 2.3 Dependency Analysis

```javascript
// bundle-size-tracker.config.js
module.exports = {
  ai: {
    enabled: true,
    analysisTypes: ['dependencies']
  },
  dependencies: {
    analysis: {
      duplicates: true,
      unused: true,
      outdated: true
    },
    recommendations: {
      alternatives: true,
      versions: true
    },
    ignore: [
      'react',
      'react-dom'
    ]
  }
};
```

## 3. Giám Sát Performance

### 3.1 RUM với Phân Tích Chi Tiết

```javascript
// bundle-size-tracker.config.js
module.exports = {
  rum: {
    enabled: true,
    sampleRate: 0.1,
    metrics: {
      core: {
        loadTime: true,
        fcp: true,
        lcp: true,
        fid: true,
        cls: true
      },
      custom: {
        memoryUsage: {
          enabled: true,
          interval: 5000
        },
        resourceTiming: {
          enabled: true,
          resourceTypes: ['script', 'css', 'image']
        }
      }
    },
    storage: {
      type: 'elasticsearch',
      node: 'http://localhost:9200'
    },
    analytics: {
      realtime: {
        enabled: true,
        interval: 60000
      },
      alerts: [
        {
          metric: 'lcp',
          condition: 'p95 > 2500',
          channels: ['slack']
        }
      ]
    }
  }
};
```

### 3.2 Performance Budget

```javascript
// bundle-size-tracker.config.js
module.exports = {
  performance: {
    budget: {
      javascript: {
        total: 500 * 1024, // 500KB
        initial: 300 * 1024, // 300KB
        async: 200 * 1024 // 200KB
      },
      assets: {
        total: 1024 * 1024, // 1MB
        images: 500 * 1024, // 500KB
        fonts: 200 * 1024 // 200KB
      },
      metrics: {
        fcp: 1000, // 1s
        lcp: 2500, // 2.5s
        tti: 3500 // 3.5s
      }
    },
    tracking: {
      enabled: true,
      history: true,
      alerts: true
    }
  }
};
```

## 4. CI/CD Integration

### 4.1 GitHub Actions Workflow

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Check bundle size
        uses: @avixiii/bundle-size-tracker-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          build-script: build
          max-size: 500
          fail-on-error: true
```

### 4.2 GitLab CI Pipeline

```yaml
# .gitlab-ci.yml
bundle_size:
  stage: build
  script:
    - npm ci
    - npm run build
    - npx bundle-size-tracker check
  artifacts:
    reports:
      bundle_size: bundle-report.json
  only:
    - merge_requests
```

### 4.3 Custom CI Integration

```javascript
// bundle-size-tracker.config.js
module.exports = {
  ci: {
    enabled: true,
    provider: 'custom',
    onAnalysisComplete: async (result) => {
      const { totalSize, bundles, status } = result;
      
      // Gửi kết quả đến CI system
      await fetch(process.env.CI_API_URL, {
        method: 'POST',
        body: JSON.stringify({
          build: process.env.BUILD_ID,
          size: totalSize,
          bundles,
          status
        })
      });
    },
    artifacts: {
      enabled: true,
      path: './reports',
      retention: '30d'
    }
  }
};
```

## 5. Custom Analytics

### 5.1 Custom Metrics Collection

```javascript
// bundle-size-tracker.config.js
module.exports = {
  analytics: {
    custom: {
      metrics: [
        {
          name: 'routeLoadTime',
          collect: () => {
            performance.mark('route-end');
            return performance.measure(
              'route-load',
              'route-start',
              'route-end'
            ).duration;
          }
        },
        {
          name: 'memoryUsage',
          collect: () => performance.memory.usedJSHeapSize
        }
      ],
      events: [
        {
          name: 'userInteraction',
          collect: (event) => ({
            type: event.type,
            target: event.target.tagName,
            timestamp: Date.now()
          })
        }
      ]
    }
  }
};
```

### 5.2 Custom Storage Integration

```javascript
// custom-storage.js
class CustomStorage {
  async save(data) {
    // Lưu data vào custom storage
  }
  
  async get(query) {
    // Lấy data từ custom storage
  }
  
  async aggregate(pipeline) {
    // Thực hiện aggregation
  }
}

// bundle-size-tracker.config.js
module.exports = {
  storage: {
    provider: new CustomStorage(),
    options: {
      batchSize: 100,
      flushInterval: 5000
    }
  }
};
```

### 5.3 Real-time Dashboard

```javascript
// bundle-size-tracker.config.js
module.exports = {
  dashboard: {
    enabled: true,
    port: 3000,
    auth: {
      username: process.env.DASHBOARD_USER,
      password: process.env.DASHBOARD_PASS
    },
    realtime: {
      enabled: true,
      websocket: true
    },
    panels: [
      {
        name: 'Bundle Size Trends',
        type: 'line',
        data: {
          source: 'history',
          metric: 'totalSize',
          interval: '1d'
        }
      },
      {
        name: 'Performance Metrics',
        type: 'gauge',
        data: {
          source: 'rum',
          metrics: ['lcp', 'fid', 'cls'],
          aggregate: 'p95'
        }
      }
    ]
  }
};
```

## Script Examples

### Package.json Scripts

```json
{
  "scripts": {
    "analyze": "bundle-size-tracker analyze",
    "check": "bundle-size-tracker check",
    "report": "bundle-size-tracker report",
    "dashboard": "bundle-size-tracker dashboard",
    "export": "bundle-size-tracker export --format json",
    "compare": "bundle-size-tracker compare --branch main"
  }
}
```

### Custom Build Scripts

```bash
#!/bin/bash

# build-and-analyze.sh
npm run build
npx bundle-size-tracker analyze --format html
if [ $? -eq 0 ]; then
  echo "Bundle size check passed!"
else
  echo "Bundle size check failed!"
  exit 1
fi
```

## Debugging Examples

### Debug Configuration

```javascript
// bundle-size-tracker.config.js
module.exports = {
  debug: {
    enabled: true,
    verbose: true,
    saveArtifacts: true,
    artifactsPath: './debug',
    console: {
      level: 'debug',
      format: 'pretty'
    },
    file: {
      enabled: true,
      path: './logs/debug.log'
    }
  }
};
```

### Debug Commands

```bash
# Enable debug mode
DEBUG=bundle-size-tracker* npm run build

# Save detailed analysis
npm run analyze -- --debug --save-artifacts

# Check specific bundles
npm run check -- --debug --bundle vendor

# Export debug data
npm run export -- --debug --format json
```
