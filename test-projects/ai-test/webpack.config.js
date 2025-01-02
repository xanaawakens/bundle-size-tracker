const path = require('path');
const { bundleSizeTrackerWebpack } = require('../../dist');
require('dotenv').config({ path: '../../.env' });

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    bundleSizeTrackerWebpack({
      maxSize: 1000,
      ai: {
        enabled: true,
        model: process.env.OPENAI_MODEL,
        temperature: parseFloat(process.env.AI_TEMPERATURE)
      }
    })
  ],
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          test: /[\\/]node_modules[\\/](preact|@emotion|@mui[\\/]styled-engine)[\\/]/,
          name: 'framework',
          chunks: 'all',
          priority: 40,
          enforce: true
        },
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          chunks: 'all',
          priority: 30,
          enforce: true
        },
        lib: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `lib.${packageName.replace('@', '')}`;
          },
          priority: 20,
          minChunks: 1,
          reuseExistingChunk: true
        },
        shared: {
          test: /[\\/]src[\\/]components[\\/]/,
          name: 'shared',
          chunks: 'async',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true
        }
      }
    }
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
