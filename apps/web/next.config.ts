import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@pucara/shared', '@pucara/design-tokens'],
  poweredByHeader: false,
};
export default config;
