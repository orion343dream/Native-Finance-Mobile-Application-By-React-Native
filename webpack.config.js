const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Ensure the app works in Replit's iframe environment
      https: false,
      mode: env.mode || 'development',
    },
    argv
  );

  // Configure development server for Replit
  if (config.devServer) {
    config.devServer = {
      ...config.devServer,
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      // Disable host check for Replit proxy
      disableHostCheck: true,
      // Allow iframe embedding
      contentBase: false,
      compress: true,
      hot: true,
      historyApiFallback: true,
    };
  }

  return config;
};