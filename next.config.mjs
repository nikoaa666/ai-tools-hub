/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  poweredByHeader: false,
  generateBuildId: () => `build-${Date.now()}`,
};

export default nextConfig;
