# Bundle Size Tracker

A powerful tool to track and optimize your JavaScript bundle sizes with AI-powered suggestions.

## Features

### Core Features
- Track bundle sizes across builds
- Set size limits and get warnings
- Generate detailed reports
- Support for multiple compression formats (raw, gzip, brotli)
- Integration with CI/CD pipelines

### AI-Powered Optimization (New in v0.1.2)
- Intelligent bundle analysis using OpenAI's GPT models
- Smart code splitting suggestions
- Tree shaking opportunities detection
- Dependency analysis
- Performance impact predictions

### Performance Optimizations (New in v0.1.2)
- Preact compatibility layer for React apps
- Optimized chunk splitting strategies
- Advanced tree shaking configuration
- Styled-components optimization
- Dynamic imports and code splitting
- Bundle size reduction up to 50%

## Installation

```bash
npm install @avixiii/bundle-size-tracker --save-dev
```

## Usage

### Basic Usage

```javascript
// webpack.config.js
const { bundleSizeTrackerWebpack } = require('@avixiii/bundle-size-tracker');

module.exports = {
  // ... your webpack config
  plugins: [
    bundleSizeTrackerWebpack({
      maxSize: 1000, // KB
      ai: {
        enabled: true,
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      }
    })
  ]
};
```

### Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.7
```

## Test Project

The repository includes a test project that demonstrates the optimization capabilities:

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

## Changelog

### v0.1.2 (2025-01-02)
- Added AI-powered bundle analysis
- Added Preact compatibility layer
- Improved code splitting strategies
- Added styled-components optimization
- Added tree shaking improvements
- Added test project with optimization examples
- Reduced bundle sizes by up to 50%

### v0.1.1
- Initial release
- Basic bundle size tracking
- Size limits and warnings
- Compression format support
- CI/CD integration

## License

MIT
