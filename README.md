# Bundle Size Tracker

[![npm version](https://badge.fury.io/js/%40avixiii%2Fbundle-size-tracker.svg)](https://www.npmjs.com/package/@avixiii/bundle-size-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A powerful and flexible tool to track and analyze JavaScript bundle sizes across different build tools. Monitor your bundle sizes, set size limits, and get detailed reports in various formats.

## Features

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
      outputPath: './reports'
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
      outputFormat: 'json'
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
      outputFormat: 'console'
    })
  ]
};
```

### CLI Usage

```bash
# Check bundle sizes in a directory
npx @avixiii/bundle-size-tracker --max-size 500 --output html --dir ./dist

# With custom configuration
npx @avixiii/bundle-size-tracker --config bundle-size.config.js
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSize` | number | 500 | Maximum allowed size in KB |
| `outputFormat` | 'console' \| 'json' \| 'html' | 'console' | Report format |
| `outputPath` | string | './report' | Output directory for reports |
| `rules` | BundleRule[] | [] | Custom rules for specific bundles |

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

## GitHub Actions Integration

Create `.github/workflows/bundle-size.yml`:

```yaml
name: Bundle Size Check

on:
  pull_request:
    branches: [ main ]

jobs:
  check-bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Check bundle size
        run: npx @avixiii/bundle-size-tracker --max-size 500 --output json
        # Will exit with code 1 if any bundle exceeds the limit
```

## Programmatic Usage

You can also use the analyzer programmatically:

```typescript
import { BundleSizeAnalyzer } from '@avixiii/bundle-size-tracker';

const analyzer = new BundleSizeAnalyzer({
  maxSize: 500,
  outputFormat: 'json',
  outputPath: './reports'
});

// Analyze specific files
await analyzer.analyzeBundles([
  'dist/main.js',
  'dist/vendor.js'
]);
```

## Report Examples

### Console Output
```
 Bundle Size Report

Generated: 2024-12-29T04:12:22.777Z
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
```

### HTML Report
The HTML report includes a visual representation of bundle sizes with color-coding for bundles that exceed their limits.

### JSON Report
```json
{
  "timestamp": "2024-12-29T04:12:13.436Z",
  "bundles": [
    {
      "name": "main.js",
      "size": 169160,
      "exceedsLimit": false,
      "sizeLimit": 300
    }
  ],
  "status": "pass",
  "totalSize": 169160
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Development

```bash
# Clone the repository
git clone https://github.com/avixiii-dev/bundle-size-tracker.git

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Create an [Issue](https://github.com/avixiii-dev/bundle-size-tracker/issues) for bug reports and feature requests
- Star the project if you find it useful
- Follow the [author](https://github.com/avixiii-dev) for updates
