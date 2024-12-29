import path from 'path';
import { bundleSizeTrackerWebpack } from '../../dist/index.js';

export default {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(process.cwd(), 'dist'),
  },
  plugins: [
    bundleSizeTrackerWebpack({
      maxSize: '100KB',
      warningSize: '50KB'
    })
  ]
};
