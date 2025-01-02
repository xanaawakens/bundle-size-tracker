import { BundleSizeAnalyzer } from '../src/core/analyzer';

describe('BundleSizeAnalyzer', () => {
  it('should be defined', () => {
    const analyzer = new BundleSizeAnalyzer({
      maxSize: 500,
      outputFormat: 'json',
      outputPath: './reports'
    });
    expect(analyzer).toBeDefined();
  });

  it('should initialize with correct options', () => {
    const options = {
      maxSize: 500,
      outputFormat: 'json' as const,
      outputPath: './reports'
    };
    const analyzer = new BundleSizeAnalyzer(options);
    expect(analyzer).toHaveProperty('options.maxSize', options.maxSize);
    expect(analyzer).toHaveProperty('options.outputFormat', options.outputFormat);
    expect(analyzer).toHaveProperty('options.outputPath', options.outputPath);
  });

  it('should have default compression enabled', () => {
    const analyzer = new BundleSizeAnalyzer({
      maxSize: 500,
      outputFormat: 'json',
      outputPath: './reports'
    });
    expect(analyzer).toHaveProperty('options.compression', true);
  });

  it('should have empty rules by default', () => {
    const analyzer = new BundleSizeAnalyzer({
      maxSize: 500,
      outputFormat: 'json',
      outputPath: './reports'
    });
    expect(analyzer).toHaveProperty('options.rules', []);
  });
});
