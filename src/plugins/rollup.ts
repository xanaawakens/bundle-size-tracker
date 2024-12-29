import type { Plugin } from 'rollup';
import * as path from 'node:path';
import type { BundleSizeTrackerOptions } from '../types/index.js';
import { BundleSizeAnalyzer } from '../core/analyzer.js';

export function bundleSizeTracker(options: BundleSizeTrackerOptions = {}): Plugin {
  const analyzer = new BundleSizeAnalyzer(options);
  
  return {
    name: 'bundle-size-tracker',
    
    async writeBundle(outputOptions, bundle) {
      const outputDir = outputOptions.dir || path.dirname(outputOptions.file || '');
      const files = Object.keys(bundle).map(fileName => 
        path.resolve(process.cwd(), outputDir, fileName)
      );
      
      try {
        await analyzer.analyzeBundles(files);
      } catch (error) {
        console.error('Bundle size analysis failed:', error);
      }
    }
  };
}
