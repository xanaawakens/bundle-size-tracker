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

### Performance Features ⚡️
- Preact compatibility layer for React apps
- Optimized chunk splitting strategies
- Advanced tree shaking configuration
- Styled-components optimization
- Dynamic imports and code splitting
- Bundle size reduction up to 50%

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

Generated: 2025-01-02T04:12:22.777Z
Status: PASS 
Total Size: 264.09 KB

main.js
Size: 58.94 KB
Limit: 400KB
Status: Within limit

vendor.js
Size: 204.58 KB
Limit: 400KB
Status: Within limit

AI Suggestions:
- Split vendor chunks for better caching
- Remove unused moment.js locales
- Implement dynamic imports for route components
```

### HTML Report Features
- Visual representation of bundle sizes
- Size trends over time
- AI optimization suggestions
- Interactive charts and graphs
- Detailed bundle breakdown
- Color-coding for bundles exceeding limits
- Performance metrics and trends
- Dependency analysis visualization

### JSON Report Example
```json
{
  "timestamp": "2025-01-02T04:12:13.436Z",
  "bundles": [
    {
      "name": "main.js",
      "size": 169160,
      "exceedsLimit": false,
      "sizeLimit": 300,
      "compression": {
        "gzip": 45200,
        "brotli": 40100
      }
    }
  ],
  "status": "pass",
  "totalSize": 169160,
  "aiSuggestions": [
    "Split vendor chunks for better caching",
    "Remove unused exports",
    "Use dynamic imports for routes"
  ],
  "performance": {
    "loadTime": "1.2s",
    "firstContentfulPaint": "0.8s"
  }
}
```

## Test Project

The repository includes a test project that demonstrates all features:

```bash
cd test-projects/ai-test
npm install
npm run build
```

The test project showcases:
- React/Preact compatibility
- MUI components optimization
- Dynamic imports
- Tree shaking
- Code splitting
- Bundle size optimization
- AI-powered suggestions
- Custom rules implementation
- Multiple output formats

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/avixiii-dev/bundle-size-tracker.git

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linter
npm run lint

# Generate documentation
npm run docs
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- -t "test name"

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Changelog

### v0.1.3 (2025-01-02)
- Added history tracking feature
- Added alerts for total size increases and chunk size changes
- Improved HTML reports with interactive charts
- Enhanced AI-powered optimization suggestions
- Added new CLI options for history and alerts
- Improved error handling and reporting
- Updated dependencies to latest versions

### v0.1.2 (2025-01-02)
- Added AI-powered bundle analysis
- Added Preact compatibility layer
- Improved code splitting strategies
- Added styled-components optimization
- Added tree shaking improvements
- Added test project with optimization examples
- Reduced bundle sizes by up to 50%
- Enhanced HTML reports with interactive features
- Added new CLI options for AI analysis
- Improved error handling and reporting
- Added TypeScript type definitions
- Updated dependencies to latest versions

### v0.1.1
- Initial release
- Basic bundle size tracking
- Size limits and warnings
- Compression format support
- Basic reporting features
- Command-line interface
- Configuration options
- Documentation

## Support

- Create an [Issue](https://github.com/avixiii-dev/bundle-size-tracker/issues) for bug reports and feature requests
- Star the project if you find it useful
- Follow [@avixiii-dev](https://github.com/avixiii-dev) for updates
<!-- - Join our [Discord community](https://discord.gg/bundlesize) for help -->
<!-- - Read our [blog posts](https://dev.to/avixiii) for tips and tutorials -->

## Security

Please report security vulnerabilities to avixiii@proton.me. We take security seriously and will respond promptly.

## License

MIT  [Tuan](https://github.com/avixiii-dev)

See [LICENSE](LICENSE) for more details.

<!-- ## Acknowledgments

- Thanks to all contributors
- Inspired by [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) -->
