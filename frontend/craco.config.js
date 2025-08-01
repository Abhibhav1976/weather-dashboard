const path = require('path');

const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  // The 'babel' section has been completely removed.

  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      if (config.disableHotReload) {
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return plugin.constructor.name !== 'HotModuleReplacementPlugin';
        });

        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // ignore everything
        };
      } else {
        webpackConfig.watchOptions = {
          ...(webpackConfig.watchOptions || {}),
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }

      return webpackConfig;
    },
  },
};
