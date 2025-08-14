// next.config.mjs - FIXED VERSION
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'standalone' output when using custom server
  // output: 'standalone', // REMOVE THIS LINE
  
  // Move outputFileTracingRoot out of experimental and use absolute path
  outputFileTracingRoot: '/home/mrwdgsha/public_html/public_app',
  trailingSlash: true,
  
  images: {
    unoptimized: true,
    domains: [], // Add your image domains here
  },
  
  // Force server-side rendering for all pages
  serverExternalPackages: [],
  
  // If you're using a subdirectory on cPanel, uncomment these:
  // basePath: '/your-app-name',
  // assetPrefix: '/your-app-name',
}

export default nextConfig;