/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'shared': path.resolve(__dirname, '../../packages/shared/src'),
    };
    return config;
  },
};

module.exports = nextConfig;
