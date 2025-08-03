const { createDirectus, staticToken, rest} = require('@directus/sdk');

const DIRECTUS_API_URL = process.env.DIRECTUS_API_URL || 'https://dxri5rqql2ood.cloudfront.net/cms';
const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || 'mimR_J-g5rYCvNoNnH6nxPD83cGIG4Hg';

// const directus = new DirectusClient(DIRECTUS_API_URL).with(staticToken(DIRECTUS_STATIC_TOKEN)).with(rest());

const directus = createDirectus(DIRECTUS_API_URL)
  .with(staticToken(DIRECTUS_STATIC_TOKEN))
  .with(
    rest({
      onRequest: (options) => ({ ...options, cache: "no-store" }),
    }),
  );
module.exports = directus;
