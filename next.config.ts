import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  //output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
//export default nextConfig;
// @ts-ignore
