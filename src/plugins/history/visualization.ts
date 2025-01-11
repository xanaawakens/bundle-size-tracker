import { writeFile } from 'fs/promises';
import { join } from 'path';
import { BundleStats } from '../../types/history';

export class BundleVisualizer {
  private readonly templatePath: string;
  private readonly outputPath: string;

  constructor(outputDir: string) {
    this.outputPath = join(outputDir, 'bundle-report.html');
  }

  async generateReport(history: BundleStats[]): Promise<string> {
    const chartData = this.prepareChartData(history);
    const html = this.generateHTML(chartData);
    
    await writeFile(this.outputPath, html);
    return this.outputPath;
  }

  private prepareChartData(history: BundleStats[]) {
    return {
      labels: history.map(entry => new Date(entry.timestamp).toLocaleDateString()),
      totalSize: history.map(entry => entry.totalSize / 1024), // Convert to KB
      gzipSize: history.map(entry => entry.gzipSize / 1024),
      brotliSize: history.map(entry => entry.brotliSize / 1024),
      chunks: this.prepareChunksData(history)
    };
  }

  private prepareChunksData(history: BundleStats[]) {
    // Get unique chunk names
    const chunkNames = new Set<string>();
    history.forEach(entry => {
      entry.chunks.forEach(chunk => chunkNames.add(chunk.name));
    });

    // Prepare data for each chunk
    const chunksData: Record<string, number[]> = {};
    Array.from(chunkNames).forEach(chunkName => {
      chunksData[chunkName] = history.map(entry => {
        const chunk = entry.chunks.find(c => c.name === chunkName);
        return chunk ? chunk.size / 1024 : 0;
      });
    });

    return chunksData;
  }

  private generateHTML(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Bundle Size History Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .chart-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1, h2 {
            color: #333;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2196f3;
        }
    </style>
</head>
<body>
    <h1>Bundle Size History Report</h1>
    
    <div class="summary">
        <div class="stat-card">
            <h3>Latest Total Size</h3>
            <div class="stat-value">${data.totalSize[data.totalSize.length - 1].toFixed(2)} KB</div>
        </div>
        <div class="stat-card">
            <h3>Latest Gzip Size</h3>
            <div class="stat-value">${data.gzipSize[data.gzipSize.length - 1].toFixed(2)} KB</div>
        </div>
        <div class="stat-card">
            <h3>Latest Brotli Size</h3>
            <div class="stat-value">${data.brotliSize[data.brotliSize.length - 1].toFixed(2)} KB</div>
        </div>
    </div>

    <div class="chart-container">
        <h2>Bundle Size Over Time</h2>
        <canvas id="sizeChart"></canvas>
    </div>

    <div class="chart-container">
        <h2>Chunk Sizes</h2>
        <canvas id="chunksChart"></canvas>
    </div>

    <script>
        // Size History Chart
        new Chart(document.getElementById('sizeChart'), {
            type: 'line',
            data: {
                labels: ${JSON.stringify(data.labels)},
                datasets: [
                    {
                        label: 'Total Size (KB)',
                        data: ${JSON.stringify(data.totalSize)},
                        borderColor: '#2196f3',
                        fill: false
                    },
                    {
                        label: 'Gzip Size (KB)',
                        data: ${JSON.stringify(data.gzipSize)},
                        borderColor: '#4caf50',
                        fill: false
                    },
                    {
                        label: 'Brotli Size (KB)',
                        data: ${JSON.stringify(data.brotliSize)},
                        borderColor: '#ff9800',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Size (KB)'
                        }
                    }
                }
            }
        });

        // Chunks Chart
        new Chart(document.getElementById('chunksChart'), {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(data.labels)},
                datasets: Object.entries(${JSON.stringify(data.chunks)}).map(([name, sizes], index) => ({
                    label: name,
                    data: sizes,
                    backgroundColor: [
                        '#2196f3',
                        '#4caf50',
                        '#ff9800',
                        '#f44336',
                        '#9c27b0',
                        '#00bcd4',
                    ][index % 6]
                }))
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Size (KB)'
                        }
                    },
                    x: {
                        stacked: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }
}
