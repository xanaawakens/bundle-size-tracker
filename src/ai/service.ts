import OpenAI from 'openai';
import type { BundleInfo, AIAnalysisResult } from '../types';

export class AIService {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4') {
    this.openai = new OpenAI({
      apiKey
    });
    this.model = model;
  }

  async analyzeBundleStructure(bundleInfo: BundleInfo): Promise<AIAnalysisResult> {
    const prompt = this.generateAnalysisPrompt(bundleInfo);
    const completion = await this.openai.chat.completions.create({
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
      ]
    });

    const suggestions = completion.choices[0]?.message?.content || '';
    return this.parseAISuggestions(suggestions, bundleInfo);
  }

  private generateAnalysisPrompt(bundleInfo: BundleInfo): string {
    return `Analyze this JavaScript bundle structure:

Bundle Name: ${bundleInfo.name}
Raw Size: ${bundleInfo.size.raw} bytes
Gzip Size: ${bundleInfo.size.gzip || 'N/A'} bytes
Brotli Size: ${bundleInfo.size.brotli || 'N/A'} bytes

Please provide detailed analysis and suggestions for:
1. Code splitting opportunities (identify specific split points)
2. Tree shaking improvements (identify unused exports)
3. Bundle size optimization strategies
4. Loading performance improvements

Focus on actionable recommendations with specific paths and estimated impact.`;
  }

  private parseAISuggestions(suggestions: string, bundleInfo: BundleInfo): AIAnalysisResult {
    // Extract code splitting suggestions
    const codeSplittingRegex = /Code splitting:[\s\S]*?(?=Tree shaking:|$)/i;
    const codeSplittingMatch = suggestions.match(codeSplittingRegex);
    const codeSplitting = codeSplittingMatch ? this.parseCodeSplitting(codeSplittingMatch[0]) : undefined;

    // Extract tree shaking suggestions
    const treeShakingRegex = /Tree shaking:[\s\S]*?(?=Bundle size:|$)/i;
    const treeShakingMatch = suggestions.match(treeShakingRegex);
    const treeShaking = treeShakingMatch ? this.parseTreeShaking(treeShakingMatch[0]) : undefined;

    // Extract general optimizations
    const optimizations = suggestions
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(1).trim());

    // Calculate estimated impact
    const impact = this.calculateEstimatedImpact(bundleInfo, codeSplitting, treeShaking);

    return {
      optimizations,
      impact,
      codeSplitting,
      treeShaking
    };
  }

  private parseCodeSplitting(text: string): AIAnalysisResult['codeSplitting'] {
    const lines = text.split('\n').filter(line => line.trim());
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

  private parseTreeShaking(text: string): AIAnalysisResult['treeShaking'] {
    const lines = text.split('\n').filter(line => line.trim());
    const unusedExports = lines
      .filter(line => line.includes('export'))
      .map(line => {
        const [module, ...exports] = line.split(':').map(s => s.trim());
        return {
          module,
          exports: exports[0].split(',').map(e => e.trim())
        };
      });

    return {
      unusedExports,
      potentialSavings: unusedExports.length * 1000 // Example estimation
    };
  }

  private calculateEstimatedImpact(
    bundleInfo: BundleInfo,
    codeSplitting?: AIAnalysisResult['codeSplitting'],
    treeShaking?: AIAnalysisResult['treeShaking']
  ): AIAnalysisResult['impact'] {
    const totalSize = bundleInfo.size.raw;
    
    // Calculate potential size reduction
    const codeSplittingSavings = codeSplitting?.impact.reduce((acc, curr) => acc + curr.sizeReduction, 0) || 0;
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
