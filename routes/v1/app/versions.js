module.exports = {
  method: 'GET',
  path: '/api/v1/app/versions',
  options: { auth: false },
  handler: async (request, h) => {
    // app version output
    let versions = {
      windows: {
        latest: '0.4.0-beta',
        required: '0.3.0',
        description: 'A new version is available, please update your Cypherpunk Privacy app from https://cypherpunk.com/download'
      },
      macos: {
        latest: '0.4.0-beta',
        required: '0.3.0',
        description: 'A new version is available, please update your Cypherpunk Privacy app from https://cypherpunk.com/download'
      },
      linux: {
        latest: '0.4.0-beta',
        required: '0.3.0',
        description: 'A new version is available, please update your Cypherpunk Privacy app from https://cypherpunk.com/download'
      },
      android: {
        latest: 56,
        required: 55,
        description: 'A new version is available, please update your Cypherpunk Privacy app from Google Play.'
      },
      ios: {
        latest: 56,
        required: 55,
        description: 'A new version is available, please update your Cypherpunk Privacy app from the iTunes App store.'
      },
      chrome: {
        latest: 56,
        required: 55,
        description: 'A new version is available, please update your Cypherpunk Privacy app from the Chrome webstore.'
      },
      firefox: {
        latest: 56,
        required: 55,
        description: 'A new version is available, please update your Cypherpunk Privacy app from the Mozilla Add-ons.'
      }
    };

    // create stripe account
    return versions;
  }
};
