/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  output: isStaticExport ? 'export' : 'standalone',
  // basePath is set when deploying to GitHub Pages (/<repo-name>)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Required for static export — Next.js image optimisation needs a server
  images: { unoptimized: isStaticExport },
  turbopack: {
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
