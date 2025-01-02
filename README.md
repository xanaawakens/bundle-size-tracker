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

### Performance Features ⚡️ (New in v0.1.2)
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

### With AI Analysis

```javascript
// webpack.config.js
const { BundleSizeTrackerPlugin } = require('@avixiii/bundle-size-tracker');

module.exports = {
  plugins: [
    new BundleSizeTrackerPlugin({
      maxSize: 500,
      ai: {
        enabled: true,
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      }
    })
  ]
};
```

### Environment Setup

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.7
```

## CLI Usage

```bash
# Basic usage
npx @avixiii/bundle-size-tracker --max-size 500

# With custom config
npx @avixiii/bundle-size-tracker --config bundle-size.config.js

# Generate HTML report
npx @avixiii/bundle-size-tracker --output html --dir ./dist

# With AI analysis
npx @avixiii/bundle-size-tracker --ai-enabled --max-size 500

# Check bundle sizes in a directory
npx @avixiii/bundle-size-tracker --max-size 500 --output html --dir ./dist

# With custom configuration
npx @avixiii/bundle-size-tracker --config bundle-size.config.js
```

## Configuration Options

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSize` | number | 500 | Maximum allowed size in KB |
| `outputFormat` | 'console' \| 'json' \| 'html' | 'console' | Report format |
| `outputPath` | string | './report' | Output directory for reports |
| `compression` | boolean \| object | true | Enable/configure compression |
| `rules` | Rule[] | [] | Custom rules for specific bundles |
| `ai` | AIConfig | undefined | AI analysis configuration |

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

### AI Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | false | Enable AI analysis |
| `model` | string | 'gpt-3.5-turbo' | OpenAI model to use |
| `temperature` | number | 0.7 | Model temperature |


## Programmatic Usage

You can use the analyzer programmatically in different ways:

### Basic Usage

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

### With AI Analysis

```typescript
import { BundleSizeAnalyzer } from '@avixiii/bundle-size-tracker';

const analyzer = new BundleSizeAnalyzer({
  maxSize: 500,
  outputFormat: 'json',
  outputPath: './reports',
  ai: {
    enabled: true,
    model: 'gpt-3.5-turbo'
  }
});

// Get AI-powered suggestions
const analysis = await analyzer.analyzeWithAI([
  'dist/main.js',
  'dist/vendor.js'
]);
```

### Custom Rules

```typescript
import { BundleSizeAnalyzer } from '@avixiii/bundle-size-tracker';

const analyzer = new BundleSizeAnalyzer({
  rules: [
    {
      pattern: /vendor\..+\.js$/,
      maxSize: 800
    }
  ],
  outputFormat: 'html'
});

// Analyze with custom rules
const results = await analyzer.analyze();
```

## Report Examples

### Console Output
```
Bundle Size Report

Generated: 2025-01-02T04:12:22.777Z
Status: PASS ✅
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
