import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { filesize } from 'filesize';
import chalk from 'chalk';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import type { BundleSizeTrackerOptions, BundleInfo, BundleReport, BundleSize } from '../types';

export class BundleSizeAnalyzer {
  private options: Required<BundleSizeTrackerOptions>;

  constructor(options: BundleSizeTrackerOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? 500,
      outputFormat: options.outputFormat ?? 'console',
      outputPath: options.outputPath ?? './report',
      rules: options.rules ?? [],
      compression: options.compression ?? true
    };
  }

  private getSizeLimit(fileName: string) {
    const matchingRule = this.options.rules.find(rule => {
      if (rule.pattern instanceof RegExp) {
        return rule.pattern.test(fileName);
      }
      return fileName.includes(rule.pattern);
    });

    return {
      raw: matchingRule?.maxSize ?? this.options.maxSize,
      gzip: matchingRule?.maxCompressedSize,
      brotli: matchingRule?.maxCompressedSize
    };
  }

  private async getFileSize(filePath: string): Promise<BundleSize> {
    const content = await fs.readFile(filePath);
    const size: BundleSize = { raw: content.length };

    const compression = this.options.compression;
    if (compression === false) return size;

    const useGzip = compression === true || compression.gzip;
    const useBrotli = compression === true || compression.brotli;

    if (useGzip) {
      size.gzip = gzipSync(content).length;
    }

    if (useBrotli) {
      size.brotli = brotliCompressSync(content).length;
    }

    return size;
  }

  private checkSizeLimits(size: BundleSize, limits: BundleInfo['sizeLimit']): boolean {
    if (size.raw > limits.raw * 1024) return true;
    if (limits.gzip && size.gzip && size.gzip > limits.gzip * 1024) return true;
    if (limits.brotli && size.brotli && size.brotli > limits.brotli * 1024) return true;
    return false;
  }

  async analyzeBundles(files: string[]): Promise<BundleReport> {
    const bundles: BundleInfo[] = await Promise.all(
      files.map(async (file) => {
        const size = await this.getFileSize(file);
        const sizeLimit = this.getSizeLimit(path.basename(file));
        
        return {
          name: path.basename(file),
          size,
          exceedsLimit: this.checkSizeLimits(size, sizeLimit),
          sizeLimit
        };
      })
    );

    const totalSize: BundleSize = {
      raw: bundles.reduce((sum, b) => sum + b.size.raw, 0)
    };

    if (this.options.compression !== false) {
      if (bundles.some(b => b.size.gzip)) {
        totalSize.gzip = bundles.reduce((sum, b) => sum + (b.size.gzip || 0), 0);
      }
      if (bundles.some(b => b.size.brotli)) {
        totalSize.brotli = bundles.reduce((sum, b) => sum + (b.size.brotli || 0), 0);
      }
    }

    const report: BundleReport = {
      timestamp: new Date().toISOString(),
      bundles,
      status: bundles.some(b => b.exceedsLimit) ? 'fail' : 'pass',
      totalSize
    };

    await this.generateReport(report);
    return report;
  }

  private formatSize(size: BundleSize): string {
    const parts = [
      `Raw: ${filesize(size.raw)}`,
      size.gzip && `Gzip: ${filesize(size.gzip)}`,
      size.brotli && `Brotli: ${filesize(size.brotli)}`
    ].filter(Boolean);

    return parts.join(' | ');
  }

  private formatLimit(limit: BundleInfo['sizeLimit']): string {
    const parts = [
      `Raw: ${limit.raw}KB`,
      limit.gzip && `Gzip: ${limit.gzip}KB`,
      limit.brotli && `Brotli: ${limit.brotli}KB`
    ].filter(Boolean);

    return parts.join(' | ');
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
        this.generateConsoleReport(report);
    }
  }

  private generateConsoleReport(report: BundleReport): void {
    console.log('\n Bundle Size Report\n');
    console.log(`Generated: ${report.timestamp}`);
    console.log(`Status: ${report.status === 'pass' ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Total Size: ${this.formatSize(report.totalSize)}\n`);

    for (const bundle of report.bundles) {
      console.log(bundle.name);
      console.log(`Size: ${this.formatSize(bundle.size)}`);
      console.log(`Limit: ${this.formatLimit(bundle.sizeLimit)}`);
      console.log(`Status: ${bundle.exceedsLimit ? chalk.red('Exceeds limit') : chalk.green('Within limit')}\n`);
    }
  }

  private async generateJsonReport(report: BundleReport): Promise<void> {
    const outputPath = path.resolve(this.options.outputPath, 'bundle-size-report.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
  }

  private async generateHtmlReport(report: BundleReport): Promise<void> {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>Bundle Size Report</title>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; padding: 20px; }
          .pass { color: green; } .fail { color: red; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Bundle Size Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Status: <span class="${report.status}">${report.status.toUpperCase()}</span></p>
        <p>Total Size: ${this.formatSize(report.totalSize)}</p>
        
        <h2>Bundles</h2>
        <table>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Limit</th>
            <th>Status</th>
          </tr>
          ${report.bundles.map(bundle => `
            <tr>
              <td>${bundle.name}</td>
              <td>${this.formatSize(bundle.size)}</td>
              <td>${this.formatLimit(bundle.sizeLimit)}</td>
              <td class="${bundle.exceedsLimit ? 'fail' : 'pass'}">
                ${bundle.exceedsLimit ? 'Exceeds limit' : 'Within limit'}
              </td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>`;

    const outputPath = path.resolve(this.options.outputPath, 'bundle-size-report.html');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html);
  }
}
