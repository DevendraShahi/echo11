/** @type {import('next').NextConfig} */
const devHosts = ['localhost', '127.0.0.1', '192.168.2.164'];
const devPorts = ['3000', '3001', '3002', '3003', '3004', '3005'];
const localDevOrigins = [
  ...devHosts,
  ...devHosts.flatMap((host) => devPorts.map((port) => `${host}:${port}`)),
];

const nextConfig = {
  allowedDevOrigins: [
    '*.use.devtunnels.ms',
    ...localDevOrigins,
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  experimental: {
    // Next.js 15.5.x devtools segment explorer causes intermittent
    // React Client Manifest crashes in App Router dev mode.
    devtoolSegmentExplorer: false,
    serverActions: {
      // Allow forwarded actions when running through dev tunnels/mobile browsers.
      allowedOrigins: [
        '*.use.devtunnels.ms',
        ...localDevOrigins,
      ],
    },
  },
  transpilePackages: [],
  // Exclude test-pdf from build prerendering (uses @react-pdf/renderer which doesn't support SSR)
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@supabase/ssr',
    '@supabase/supabase-js',
    'resend',
    'svix',
  ],
  // Skip API routes for prerendering 
  // Note: This won't help - we need route segment config
};

export default nextConfig;
