import { BundleStats, ChunkInfo, ModuleInfo } from '../types/history';

export class BundleAnalyzer {
  analyzeBundleChanges(
    currentStats: BundleStats,
    previousStats: BundleStats
  ): {
    totalSizeChange: {
      percentageChange: number;
      absoluteChange: number;
      message: string;
    };
    chunkAnalyses: {
      name: string;
      sizeChange: {
        percentageChange: number;
        absoluteChange: number;
        message: string;
      };
      moduleChanges: {
        added: string[];
        removed: string[];
        modified: {
          name: string;
          sizeChange: {
            percentageChange: number;
            absoluteChange: number;
            message: string;
          };
        }[];
      };
    }[];
    recommendations: string[];
  } {
    const totalSizeChange = this.analyzeSizeChange(
      currentStats.totalSize,
      previousStats.totalSize,
      'Total bundle'
    );

    const chunkAnalyses = this.analyzeChunkChanges(
      currentStats.chunks,
      previousStats.chunks
    );

    const recommendations = this.generateRecommendations(
      totalSizeChange,
      chunkAnalyses
    );

    return {
      totalSizeChange,
      chunkAnalyses,
      recommendations
    };
  }

  private analyzeSizeChange(
    currentSize: number,
    previousSize: number,
    context: string
  ): {
    percentageChange: number;
    absoluteChange: number;
    message: string;
  } {
    const absoluteChange = currentSize - previousSize;
    const percentageChange = (absoluteChange / previousSize) * 100;

    let message = `${context} size `;
    if (absoluteChange > 0) {
      message += `increased by ${this.formatBytes(absoluteChange)} (${percentageChange.toFixed(2)}%)`;
    } else if (absoluteChange < 0) {
      message += `decreased by ${this.formatBytes(Math.abs(absoluteChange))} (${Math.abs(percentageChange).toFixed(2)}%)`;
    } else {
      message += 'remained unchanged';
    }

    return {
      percentageChange,
      absoluteChange,
      message
    };
  }

  private analyzeChunkChanges(
    currentChunks: ChunkInfo[],
    previousChunks: ChunkInfo[]
  ): {
    name: string;
    sizeChange: {
      percentageChange: number;
      absoluteChange: number;
      message: string;
    };
    moduleChanges: {
      added: string[];
      removed: string[];
      modified: {
        name: string;
        sizeChange: {
          percentageChange: number;
          absoluteChange: number;
          message: string;
        };
      }[];
    };
  }[] {
    return currentChunks.map(currentChunk => {
      const previousChunk = previousChunks.find(c => c.name === currentChunk.name);

      if (!previousChunk) {
        return {
          name: currentChunk.name,
          sizeChange: {
            percentageChange: 100,
            absoluteChange: currentChunk.size,
            message: `New chunk "${currentChunk.name}" added (${this.formatBytes(currentChunk.size)})`
          },
          moduleChanges: {
            added: currentChunk.modules.map(m => m.name),
            removed: [],
            modified: []
          }
        };
      }

      const sizeChange = this.analyzeSizeChange(
        currentChunk.size,
        previousChunk.size,
        `Chunk "${currentChunk.name}"`
      );

      const moduleChanges = this.analyzeModuleChanges(
        currentChunk.modules,
        previousChunk.modules
      );

      return {
        name: currentChunk.name,
        sizeChange,
        moduleChanges
      };
    });
  }

  private analyzeModuleChanges(
    currentModules: ModuleInfo[],
    previousModules: ModuleInfo[]
  ): {
    added: string[];
    removed: string[];
    modified: {
      name: string;
      sizeChange: {
        percentageChange: number;
        absoluteChange: number;
        message: string;
      };
    }[];
  } {
    const added: string[] = [];
    const removed: string[] = [];
    const modified: {
      name: string;
      sizeChange: {
        percentageChange: number;
        absoluteChange: number;
        message: string;
      };
    }[] = [];

    // Find added and modified modules
    currentModules.forEach(currentModule => {
      const previousModule = previousModules.find(m => m.name === currentModule.name);
      if (!previousModule) {
        added.push(currentModule.name);
      } else if (currentModule.size !== previousModule.size) {
        modified.push({
          name: currentModule.name,
          sizeChange: this.analyzeSizeChange(
            currentModule.size,
            previousModule.size,
            `Module "${currentModule.name}"`
          )
        });
      }
    });

    // Find removed modules
    previousModules.forEach(previousModule => {
      if (!currentModules.find(m => m.name === previousModule.name)) {
        removed.push(previousModule.name);
      }
    });

    return { added, removed, modified };
  }

  private generateRecommendations(
    totalSizeChange: {
      percentageChange: number;
      absoluteChange: number;
      message: string;
    },
    chunkAnalyses: {
      name: string;
      sizeChange: {
        percentageChange: number;
        absoluteChange: number;
        message: string;
      };
      moduleChanges: {
        added: string[];
        removed: string[];
        modified: {
          name: string;
          sizeChange: {
            percentageChange: number;
            absoluteChange: number;
            message: string;
          };
        }[];
      };
    }[]
  ): string[] {
    const recommendations: string[] = [];

    // Size increase recommendations
    if (totalSizeChange.percentageChange > 10) {
      recommendations.push('Consider the following to reduce bundle size:');
      recommendations.push('- Review recently added dependencies');
      recommendations.push('- Check for duplicate dependencies');
      recommendations.push('- Analyze opportunities for code splitting');
    }

    // Chunk-specific recommendations
    chunkAnalyses.forEach(chunk => {
      if (chunk.sizeChange.percentageChange > 20) {
        recommendations.push(
          `- Analyze chunk "${chunk.name}" for optimization opportunities`
        );
      }
    });

    // Add general recommendations if none specific
    if (recommendations.length === 0) {
      recommendations.push('Bundle size changes are within acceptable ranges');
      recommendations.push('Consider:');
      recommendations.push('- Setting up size budgets for monitoring');
      recommendations.push('- Regular dependency audits');
    }

    return recommendations;
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
