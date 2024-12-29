const path = require('path');
const { BundleSizeTrackerPlugin } = require('../../dist');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new BundleSizeTrackerPlugin({
      maxSize: 500, // 500KB
      outputFormat: 'html',
      outputPath: './bundle-report'
    })
  ]
};
