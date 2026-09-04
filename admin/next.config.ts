import path from 'path';
import type { NextConfig } from 'next';
import withRspack from 'next-rspack';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: 'api.emrekilic.web.tr' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // socket.io-client / ws opsiyonel native bağımlılıkları; Rspack bunları zorunlu sanıyor.
  webpack(config) {
    config.resolve ??= {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      'utf-8-validate': false,
      'supports-color': false,
    };
    return config;
  },
};

export default withRspack(nextConfig);
