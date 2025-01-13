# Bundle Size Tracker

[![NPM VERSION](https://img.shields.io/npm/v/@avixiii/bundle-size-tracker)](https://www.npmjs.com/package/@avixiii/bundle-size-tracker)
![NPM TOTAL DOWNLOADS](https://img.shields.io/npm/dt/@avixiii/bundle-size-tracker)
[![LICENSE: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TYPESCRIPT READY](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)


A powerful and flexible tool to track and analyze JavaScript bundle sizes across different build tools. Monitor your bundle sizes, set size limits, and get detailed reports with AI-powered optimization suggestions.

## Features

### Core Features 🎯
- Track bundle sizes during build process
- Support for multiple build tools:
  - Webpack
  - Rollup
  - Vite
- Multiple report formats:
  - Console output
  - JSON reports
  - HTML reports with visualizations
- File compression analysis:
  - Gzip compression
  - Brotli compression
- Custom size limits per bundle
- Easy CI/CD integration
- Full TypeScript support
- Configurable alerts and warnings

### AI-Powered Optimization 🤖 (New in v0.1.2)
- Intelligent bundle analysis using OpenAI GPT models
- Smart code splitting suggestions
- Tree shaking opportunities detection
- Dependency analysis and recommendations
- Performance impact predictions
- Automated optimization suggestions

### History and Alerts 📊 (New in v0.1.3)
- Track bundle size changes over time
- Export and import history data
- Interactive size visualizations
- Configurable alerts for:
  - Total size increases
  - Individual chunk size changes
  - Maximum size thresholds
- Beautiful HTML reports with charts
- Historical trend analysis
- Size comparison across builds

### Real User Monitoring 📈 (New in v0.1.4)
- Track real-world performance metrics:
  - Load time
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
  - Time to Interactive (TTI)
  - Total Blocking Time (TBT)
- Device and network analysis:
  - Device type detection
  - Network connection speed
  - Hardware capabilities
- Performance recommendations:
  - Automated performance insights
  - Device-specific optimizations
  - Network-based suggestions
- Customizable data collection:
  - Configurable sampling rate
  - Pattern-based URL filtering
  - Custom endpoint support

## Installation

```bash
npm install @avixiii/bundle-size-tracker --save-dev
# or
yarn add -D @avixiii/bundle-size-tracker
# or
pnpm add -D @avixiii/bundle-size-tracker
```

## Quick Start

### Webpack

```javascript
// webpack.config.js
const { BundleSizeTrackerPlugin } = require('@avixiii/bundle-size-tracker');

module.exports = {
  // ... other config
  plugins: [
    new BundleSizeTrackerPlugin({
      maxSize: 500, // 500KB limit
      outputFormat: 'html',
      outputPath: './reports',
      history: {
        enabled: true,
        thresholds: {
          totalSizeIncreaseThreshold: 10, // 10% increase warning
          maxTotalSize: 5 * 1024 * 1024 // 5MB limit
        }
      },
      rum: {
        enabled: true,
        sampleRate: 0.1, // Sample 10% of users
        endpoint: '/api/rum', // Optional custom endpoint
        excludePatterns: ['/api/*', '/static/*'] // Optional URL patterns to exclude
      }
    })
  ]
};
```

### Rollup

```javascript
// rollup.config.js
import { bundleSizeTracker } from '@avixiii/bundle-size-tracker';

export default {
  // ... other config
  plugins: [
    bundleSizeTracker({
      maxSize: 300,
      outputFormat: 'json',
      history: {
        enabled: true,
        thresholds: {
          chunkSizeIncreaseThreshold: 15 // 15% chunk size increase warning
        }
      },
      rum: {
        enabled: true,
        sampleRate: 0.5 // Sample 50% of users
      }
    })
  ]
};
```

### Vite

```javascript
// vite.config.js
import { bundleSizeTrackerVite } from '@avixiii/bundle-size-tracker';

export default {
  plugins: [
    bundleSizeTrackerVite({
      maxSize: 400,
      history: {
        enabled: true,
        exportPath: './bundle-history'
      },
      rum: {
        enabled: true,
        sampleRate: 1, // Monitor all users
        excludePatterns: ['/admin/*'] // Exclude admin pages
      }
    })
  ]
};
```

## Configuration

### History Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `history.enabled` | boolean | `false` | Enable history tracking |
| `history.maxEntries` | number | `100` | Maximum number of history entries to keep |
| `history.thresholds.totalSizeIncreaseThreshold` | number | `10` | Percentage threshold for total size increase warning |
| `history.thresholds.chunkSizeIncreaseThreshold` | number | `15` | Percentage threshold for chunk size increase warning |
| `history.thresholds.maxTotalSize` | number | `5242880` | Maximum allowed total size in bytes (5MB) |
| `history.thresholds.maxChunkSize` | number | `2097152` | Maximum allowed chunk size in bytes (2MB) |

### RUM Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rum.enabled` | boolean | `false` | Enable Real User Monitoring |
| `rum.sampleRate` | number | `1` | Percentage of users to monitor (0 to 1) |
| `rum.endpoint` | string | undefined | Custom endpoint for sending RUM data |
| `rum.excludePatterns` | string[] | `[]` | URL patterns to exclude from monitoring |

### AI Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ai.enabled` | boolean | `false` | Enable AI analysis |
| `ai.model` | string | `'gpt-3.5-turbo'` | OpenAI model to use |
| `ai.temperature` | number | `0.7` | Model temperature |

### Compression Options

```javascript
{
  compression: {
    gzip: true,
    brotli: true,
    raw: true
  },
  reportFormats: ['json', 'html', 'console']
}
```

### Custom Rules

You can set specific size limits for different bundles:

```javascript
{
  rules: [
    {
      pattern: 'vendor', // or /vendor\..*\.js$/
      maxSize: 800 // 800KB limit for vendor bundles
    },
    {
      pattern: 'main',
      maxSize: 200 // 200KB limit for main bundle
    }
  ]
}
```

## Report Examples

### Console Output
```
Bundle Size Report

Generated: 2025-01-13T15:52:18+07:00
Status: PASS 
Total Size: 264.09 KB

main.js
  Raw: 120.5 KB
  Gzip: 45.2 KB
  Brotli: 40.1 KB
  Status: PASS 

vendor.js
  Raw: 143.59 KB
  Gzip: 52.8 KB
  Brotli: 48.3 KB
  Status: PASS 

Performance Metrics (RUM):
  Load Time (median): 1.2s
  First Contentful Paint: 0.8s
  Largest Contentful Paint: 2.1s
  First Input Delay: 45ms
  Cumulative Layout Shift: 0.05
```

## License

MIT  [avixiii](https://github.com/avixiii-dev)
