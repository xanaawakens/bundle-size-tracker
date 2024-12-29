import type { Plugin, ResolvedConfig } from 'vite';
import * as path from 'node:path';
import type { BundleSizeTrackerOptions } from '../types/index.js';
import { BundleSizeAnalyzer } from '../core/analyzer.js';

export function bundleSizeTrackerVite(options: BundleSizeTrackerOptions = {}): Plugin {
  const analyzer = new BundleSizeAnalyzer(options);
  let config: ResolvedConfig;
  
  return {
    name: 'bundle-size-tracker',
    enforce: 'post',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    
    async writeBundle(outputOptions, bundle) {
      const outputDir = outputOptions.dir || path.dirname(outputOptions.file || '');
      const files = Object.keys(bundle).map(fileName => 
        path.resolve(config.root, outputDir, fileName)
      );
      
      try {
        await analyzer.analyzeBundles(files);
      } catch (error) {
        console.error('Bundle size analysis failed:', error);
      }
    }
  };
}
