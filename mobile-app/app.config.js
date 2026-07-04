const appJson = require('./app.json');

module.exports = ({ config }) => ({
  ...config,
  expo: {
    ...appJson.expo,
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api',
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
    android: {
      ...appJson.expo.android,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
        },
      },
    },
    ios: {
      ...appJson.expo.ios,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    },
  },
});
