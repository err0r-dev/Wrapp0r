import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind';
import path from 'path';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Override webpack config to support path aliases and Tailwind
Config.overrideWebpackConfig((currentConfiguration) => {
  // Enable Tailwind CSS processing
  const withTailwind = enableTailwind(currentConfiguration);

  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...withTailwind.resolve?.alias,
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
