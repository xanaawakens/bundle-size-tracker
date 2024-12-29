#!/usr/bin/env node

import { program } from 'commander';
import * as path from 'path';
import { BundleSizeAnalyzer } from './core/analyzer';
import type { BundleSizeTrackerOptions } from './types';

program
  .name('bundle-size-tracker')
  .description('CLI tool to analyze bundle sizes')
  .option('-s, --max-size <size>', 'Maximum bundle size in KB', '500')
  .option('-o, --output <format>', 'Output format (console, json, html)', 'console')
  .option('-p, --path <path>', 'Path to output directory', './report')
  .option('-d, --dir <directory>', 'Directory containing bundles', './dist')
  .parse(process.argv);

const options = program.opts();

async function run() {
  try {
    const analyzer = new BundleSizeAnalyzer({
      maxSize: parseInt(options.maxSize),
      outputFormat: options.output as BundleSizeTrackerOptions['outputFormat'],
      outputPath: options.path
    });

    const directory = path.resolve(process.cwd(), options.dir);
    const files = await import('glob').then(glob => 
      glob.glob('**/*.{js,css}', { cwd: directory, absolute: true })
    );

    await analyzer.analyzeBundles(files);
  } catch (error) {
    console.error('Error analyzing bundles:', error);
    process.exit(1);
  }
}

run();
