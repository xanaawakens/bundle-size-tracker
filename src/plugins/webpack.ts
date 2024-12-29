import type { Compiler, Compilation } from 'webpack';
import * as path from 'node:path';
import type { BundleSizeTrackerOptions } from '../types/index.js';
import { BundleSizeAnalyzer } from '../core/analyzer.js';

export class BundleSizeTrackerPlugin {
  private analyzer: BundleSizeAnalyzer;

  constructor(options: BundleSizeTrackerOptions = {}) {
    this.analyzer = new BundleSizeAnalyzer(options);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.afterEmit.tapPromise(
      'BundleSizeTrackerPlugin',
      async (compilation: Compilation) => {
        const outputPath = compilation.outputOptions.path;
        if (!outputPath) return;

        const files = Object.keys(compilation.assets).map(name => 
          path.resolve(outputPath, name)
        );

        try {
          await this.analyzer.analyzeBundles(files);
        } catch (error) {
          console.error('Bundle size analysis failed:', error);
        }
      }
    );
  }
}
