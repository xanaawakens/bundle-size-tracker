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
}

export interface BundleRule {
  /**
   * Pattern to match bundle names
   */
  pattern: string | RegExp;
  
  /**
   * Maximum size in KB for matched bundles
   */
  maxSize: number;
}

export interface BundleInfo {
  /**
   * Name of the bundle file
   */
  name: string;

  /**
   * Size of the bundle in bytes
   */
  size: number;

  /**
   * Whether the bundle exceeds its size limit
   */
  exceedsLimit: boolean;

  /**
   * The applicable size limit in KB
   */
  sizeLimit: number;
}

export interface BundleReport {
  /**
   * Timestamp of the report
   */
  timestamp: string;

  /**
   * List of analyzed bundles
   */
  bundles: BundleInfo[];

  /**
   * Overall status of size checks
   */
  status: 'pass' | 'fail';

  /**
   * Total size of all bundles
   */
  totalSize: number;
}
