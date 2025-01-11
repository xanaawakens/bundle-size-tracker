import { writeFile } from 'fs/promises';
import { join } from 'path';
import { BundleStats } from '../../types/history';

export class BundleVisualizer {
  private readonly outputPath: string;

  constructor(outputDir: string) {
    this.outputPath = outputDir;
  }

  async generateReport(history: (BundleStats & { timestamp: string })[]): Promise<string> {
    if (!history || history.length === 0) {
      history = [];
    }

    const reportPath = join(this.outputPath, 'bundle-report.html');
    const dates = history.map(entry => entry.timestamp);
    const totalSizes = history.map(entry => entry.totalSize);
    const gzipSizes = history.map(entry => entry.gzipSize);
    const brotliSizes = history.map(entry => entry.brotliSize);

    const averageSize = history.length > 0
      ? totalSizes.reduce((a, b) => a + b, 0) / history.length
      : 0;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Bundle Size Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
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
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card h3 {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .summary-card p {
      margin: 10px 0 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  </style>
</head>
<body>
  <h1>Bundle Size Report</h1>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Latest Total Size</h3>
      <p>${formatBytes(history.length > 0 ? history[history.length - 1].totalSize : 0)}</p>
    </div>
    <div class="summary-card">
      <h3>Average Size</h3>
      <p>${formatBytes(averageSize)}</p>
    </div>
    <div class="summary-card">
      <h3>Latest Gzip Size</h3>
      <p>${formatBytes(history.length > 0 ? history[history.length - 1].gzipSize : 0)}</p>
    </div>
    <div class="summary-card">
      <h3>Latest Brotli Size</h3>
      <p>${formatBytes(history.length > 0 ? history[history.length - 1].brotliSize : 0)}</p>
    </div>
  </div>

  <div class="chart-container">
    <canvas id="sizeChart"></canvas>
  </div>

  <div class="chart-container">
    <canvas id="chunksChart"></canvas>
  </div>

  <script>
    // Size over time chart
    new Chart(document.getElementById('sizeChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(dates)},
        datasets: [
          {
            label: 'Total Size',
            data: ${JSON.stringify(totalSizes)},
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Gzip Size',
            data: ${JSON.stringify(gzipSizes)},
            borderColor: 'rgb(255, 159, 64)',
            tension: 0.1
          },
          {
            label: 'Brotli Size',
            data: ${JSON.stringify(brotliSizes)},
            borderColor: 'rgb(153, 102, 255)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Bundle Size Over Time'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Size (bytes)'
            }
          }
        }
      }
    });

    // Chunks stacked bar chart
    new Chart(document.getElementById('chunksChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(dates)},
        datasets: ${JSON.stringify(generateChunkDatasets(history))}
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Chunk Sizes Over Time'
          },
          tooltip: {
            mode: 'index'
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Size (bytes)'
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;

    await writeFile(reportPath, html);
    return reportPath;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function generateChunkDatasets(history: (BundleStats & { timestamp: string })[]) {
  if (!history || history.length === 0) return [];

  // Get unique chunk names
  const chunkNames = new Set<string>();
  history.forEach(entry => {
    entry.chunks.forEach(chunk => {
      chunkNames.add(chunk.name);
    });
  });

  // Generate a dataset for each chunk
  return Array.from(chunkNames).map((chunkName, index) => {
    const colors = [
      'rgb(75, 192, 192)',
      'rgb(255, 159, 64)',
      'rgb(153, 102, 255)',
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)'
    ];

    return {
      label: chunkName,
      data: history.map(entry => {
        const chunk = entry.chunks.find(c => c.name === chunkName);
        return chunk ? chunk.size : 0;
      }),
      backgroundColor: colors[index % colors.length]
    };
  });
}
