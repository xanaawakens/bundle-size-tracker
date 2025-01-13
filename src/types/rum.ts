export interface RUMMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface RUMData {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: RUMMetrics;
  connection?: {
    effectiveType: string;
    rtt: number;
    downlink: number;
  };
  deviceInfo?: {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    deviceType: string;
  };
}

export interface RUMConfig {
  enabled: boolean;
  sampleRate: number;
  endpoint?: string;
  customMetrics?: string[];
  excludePatterns?: string[];
}
