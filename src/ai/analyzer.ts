import type { BundleInfo, BundleReport } from '../types';
import OpenAI from 'openai';

export interface AIAnalyzerOptions {
  openaiApiKey?: string;
  model?: string;
  temperature?: number;
}

interface CodeSplittingResult {
  splitPoints: string[];
  impact: Array<{
    path: string;
    sizeReduction: number;
  }>;
}

interface TreeShakingResult {
  unusedExports: Array<{
    module: string;
    exports: string[];
  }>;
  potentialSavings: number;
}

interface ImpactEstimation {
  sizeReduction: number;
  performanceImprovement: number;
}

export class AIBundleAnalyzer {
  private openai: OpenAI;
  private model: string;
  private temperature: number;

  constructor(options: AIAnalyzerOptions = {}) {
    if (!options.openaiApiKey) {
      throw new Error('OpenAI API key is required for AI-powered analysis');
    }

    this.model = options.model || 'gpt-4';
    this.temperature = options.temperature || 0.7;
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: options.openaiApiKey
    });
  }

  async analyzeBundle(bundleInfo: BundleInfo): Promise<BundleReport> {
    try {
      // Prepare bundle data for analysis
      const analysisPrompt = this.prepareBundleAnalysisPrompt(bundleInfo);
      
      // Get AI suggestions
      const suggestions = await this.getAISuggestions(analysisPrompt);
      
      // Process and format suggestions
      return this.processAISuggestions(suggestions, bundleInfo);
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }

  private prepareBundleAnalysisPrompt(bundleInfo: BundleInfo): string {
    return `Analyze this JavaScript bundle:
    - Total Size: ${bundleInfo.size.raw} bytes
    - Gzipped Size: ${bundleInfo.size.gzip} bytes
    - Bundle Name: ${bundleInfo.name}
    
    Provide optimization suggestions for:
    1. Code splitting opportunities
    2. Tree shaking improvements
    3. Dependency optimizations
    4. Loading strategy recommendations`;
  }

  private async getAISuggestions(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a JavaScript bundle optimization expert. Analyze the bundle and provide specific, actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: this.temperature
    });

    return response.choices[0]?.message?.content || '';
  }

  private processAISuggestions(suggestions: string, bundleInfo: BundleInfo): BundleReport {
    // Process AI suggestions and combine with bundle info
    return {
      timestamp: new Date().toISOString(),
      bundles: [bundleInfo],
      status: bundleInfo.exceedsLimit ? 'fail' : 'pass',
      totalSize: bundleInfo.size,
      aiAnalysis: {
        optimizations: this.parseOptimizations(suggestions),
        impact: this.estimateImpact(suggestions, bundleInfo),
        codeSplitting: this.parseCodeSplitting(suggestions),
        treeShaking: this.parseTreeShaking(suggestions)
      }
    };
  }

  private parseOptimizations(suggestions: string): string[] {
    // Parse and format AI suggestions into actionable items
    return suggestions
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim());
  }

  private parseCodeSplitting(suggestions: string): CodeSplittingResult {
    const lines = suggestions.split('\n').filter(line => line.trim());
    const splitPoints = lines
      .filter(line => line.includes('/'))
      .map(line => {
        const match = line.match(/['"](.*?)['"]/);
        return match ? match[1] : line.trim();
      });

    return {
      splitPoints,
      impact: splitPoints.map(path => ({
        path,
        sizeReduction: Math.floor(Math.random() * 50000) // Example estimation
      }))
    };
  }

  private parseTreeShaking(suggestions: string): TreeShakingResult {
    const lines = suggestions.split('\n').filter(line => line.trim());
    const unusedExports = lines
      .filter(line => line.includes('export'))
      .map(line => {
        const [module, ...exports] = line.split(':').map(s => s.trim());
        return {
          module,
          exports: exports.join(':').split(',').map(e => e.trim())
        };
      });

    return {
      unusedExports,
      potentialSavings: unusedExports.length * 1024 // Example estimation
    };
  }

  private estimateImpact(suggestions: string, bundleInfo: BundleInfo): ImpactEstimation {
    const totalSize = bundleInfo.size.raw;
    const codeSplitting = this.parseCodeSplitting(suggestions);
    const treeShaking = this.parseTreeShaking(suggestions);
    
    // Calculate potential size reduction
    const codeSplittingSavings = codeSplitting?.impact.reduce((acc: number, curr: { sizeReduction: number }) => acc + curr.sizeReduction, 0) || 0;
    const treeShakingSavings = treeShaking?.potentialSavings || 0;
    const sizeReduction = codeSplittingSavings + treeShakingSavings;

    // Estimate performance improvement
    const performanceImprovement = Math.min(
      Math.floor((sizeReduction / totalSize) * 100),
      50 // Cap at 50% improvement
    );

    return {
      sizeReduction,
      performanceImprovement
    };
  }
}
