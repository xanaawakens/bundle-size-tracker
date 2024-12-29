import { nodeResolve } from '@rollup/plugin-node-resolve';
import { bundleSizeTracker } from '../../dist/index.js';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    nodeResolve(),
    bundleSizeTracker({
      maxSize: 300,
      outputFormat: 'json',
      outputPath: './bundle-report'
    })
  ]
};
