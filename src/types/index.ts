export interface BundleSizeTrackerOptions {
  /**
   * Maximum allowed size for bundles in KB
   * @default 500
   */
  maxSize?: number;

  /**
   * Output format for the report
   * @default 'console'
   */
  outputFormat?: 'console' | 'json' | 'html';

  /**
   * Path where to save the report
   * @default './report'
   */
  outputPath?: string;

  /**
   * Custom rules for specific bundles
   */
  rules?: BundleRule[];

  /**
   * Enable compression analysis
   * @default true
   */
  compression?: boolean | {
    gzip?: boolean;
    brotli?: boolean;
  };
}

export interface BundleRule {
  /**
   * Pattern to match bundle names
   */
  pattern: string | RegExp;

  /**
   * Maximum allowed size in KB
   */
  maxSize: number;

  /**
   * Maximum allowed compressed size in KB
   */
  maxCompressedSize?: number;
}

export interface BundleSize {
  raw: number;
  gzip?: number;
  brotli?: number;
}

export interface BundleInfo {
  /**
   * Bundle file name
   */
  name: string;

  /**
   * Bundle sizes (raw and compressed)
   */
  size: BundleSize;

  /**
   * Whether the bundle exceeds size limits
   */
  exceedsLimit: boolean;

  /**
   * Size limits in KB
   */
  sizeLimit: {
    raw: number;
    gzip?: number;
    brotli?: number;
  };
}

export interface BundleReport {
  /**
   * Report generation timestamp
   */
  timestamp: string;

  /**
   * List of analyzed bundles
   */
  bundles: BundleInfo[];

  /**
   * Overall status
   */
  status: 'pass' | 'fail';

  /**
   * Total sizes
   */
  totalSize: BundleSize;
}
