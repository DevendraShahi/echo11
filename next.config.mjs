/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    excludeDefaultLocales: ['en']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  // Exclude test-pdf from build prerendering (uses @react-pdf/renderer which doesn't support SSR)
  serverExternalPackages: ['@react-pdf/renderer'],
  // Skip API routes for prerendering 
  // Note: This won't help - we need route segment config
};

export default nextConfig;
