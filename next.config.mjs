/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async redirects() {
    return [
      {
        source: '/work/signal-fuel',
        destination: '/work/fluids',
        permanent: true,
      },
      {
        source: '/work/formline-optical',
        destination: '/work/ivision',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // The showcase page (FORGE + LALTIN landing pages live in iframes)
      // ships as public/showcase.html. /showcase is a public directory
      // (holds forge/) with no index, so it falls through to rewrites and
      // is served from the file at the clean URL.
      {
        source: '/showcase',
        destination: '/showcase.html',
      },
      // The FORGE showcase ships as a static site in public/showcase/forge.
      // Next serves its index.html only at the explicit path, so the clean
      // URL is rewritten onto it. Asset paths inside the file are absolute.
      {
        source: '/showcase/forge',
        destination: '/showcase/forge/index.html',
      },
      // Legacy static LALTIN export kept for reference; React route owns /laltin.
      {
        source: '/laltin/static',
        destination: '/laltin/index-legacy.html',
      },
    ];
  },
};

// Next sets PORT before loading the development config. Keep simultaneous
// previews and production builds from overwriting one another's server chunks.
export default (phase) => ({
  ...nextConfig,
  distDir: phase === 'phase-development-server'
    ? `.next-dev-${process.env.PORT || '3000'}`
    : '.next',
});
