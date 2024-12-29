import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { filesize } from 'filesize';
import chalk from 'chalk';
import type { BundleSizeTrackerOptions, BundleInfo, BundleReport, BundleRule } from '../types';

export class BundleSizeAnalyzer {
  private options: Required<BundleSizeTrackerOptions>;

  constructor(options: BundleSizeTrackerOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? 500,
      outputFormat: options.outputFormat ?? 'console',
      outputPath: options.outputPath ?? './report',
      rules: options.rules ?? []
    };
  }

  private getSizeLimit(fileName: string): number {
    const matchingRule = this.options.rules.find(rule => {
      if (rule.pattern instanceof RegExp) {
        return rule.pattern.test(fileName);
      }
      return fileName.includes(rule.pattern);
    });

    return matchingRule?.maxSize ?? this.options.maxSize;
  }

  async analyzeBundles(files: string[]): Promise<BundleReport> {
    const bundles: BundleInfo[] = await Promise.all(
      files.map(async (file) => {
        const stats = await fs.stat(file);
        const sizeLimit = this.getSizeLimit(path.basename(file));
        
        return {
          name: path.basename(file),
          size: stats.size,
          exceedsLimit: stats.size > sizeLimit * 1024, // Convert KB to bytes
          sizeLimit
        };
      })
    );

    const report: BundleReport = {
      timestamp: new Date().toISOString(),
      bundles,
      status: bundles.some(b => b.exceedsLimit) ? 'fail' : 'pass',
      totalSize: bundles.reduce((sum, b) => sum + b.size, 0)
    };

    await this.generateReport(report);
    return report;
  }

  private async generateReport(report: BundleReport): Promise<void> {
    switch (this.options.outputFormat) {
      case 'json':
        await this.generateJsonReport(report);
        break;
      case 'html':
        await this.generateHtmlReport(report);
        break;
      default:
        this.printConsoleReport(report);
    }
  }

  private async generateJsonReport(report: BundleReport): Promise<void> {
    await fs.mkdir(this.options.outputPath, { recursive: true });
    const filePath = path.join(this.options.outputPath, 'bundle-size-report.json');
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  }

  private async generateHtmlReport(report: BundleReport): Promise<void> {
    await fs.mkdir(this.options.outputPath, { recursive: true });
    const filePath = path.join(this.options.outputPath, 'bundle-size-report.html');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bundle Size Report</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; margin: 2rem; }
            .bundle { margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; }
            .exceeded { background-color: #fff0f0; border-color: #ff8080; }
            .ok { background-color: #f0fff0; border-color: #80ff80; }
          </style>
        </head>
        <body>
          <h1>Bundle Size Report</h1>
          <p>Generated: ${report.timestamp}</p>
          <p>Status: <strong>${report.status}</strong></p>
          <p>Total Size: ${filesize(report.totalSize)}</p>
          
          <div class="bundles">
            ${report.bundles.map(bundle => `
              <div class="bundle ${bundle.exceedsLimit ? 'exceeded' : 'ok'}">
                <h3>${bundle.name}</h3>
                <p>Size: ${filesize(bundle.size)}</p>
                <p>Limit: ${bundle.sizeLimit}KB</p>
                <p>Status: ${bundle.exceedsLimit ? '❌ Exceeds limit' : '✅ Within limit'}</p>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
    
    await fs.writeFile(filePath, html);
  }

  private printConsoleReport(report: BundleReport): void {
    console.log('\n📦 Bundle Size Report\n');
    console.log(`Generated: ${report.timestamp}`);
    console.log(`Status: ${report.status === 'pass' ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Total Size: ${filesize(report.totalSize)}\n`);

    report.bundles.forEach(bundle => {
      const sizeText = filesize(bundle.size);
      const status = bundle.exceedsLimit
        ? chalk.red('❌ Exceeds limit')
        : chalk.green('✅ Within limit');

      console.log(`${chalk.bold(bundle.name)}`);
      console.log(`Size: ${sizeText}`);
      console.log(`Limit: ${bundle.sizeLimit}KB`);
      console.log(`Status: ${status}\n`);
    });
  }
}
