require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});
const sanityClient = require('@sanity/client');

const sanity = {
  projectId: process.env.SANITY_PROJECT_ID || '8bivkoxu',
  dataset: process.env.SANITY_DATASET || 'production',
};

module.exports = sanityClient({
  ...sanity,
  useCdn: !process.env.SANITY_READ_TOKEN,
  token: process.env.SANITY_READ_TOKEN,
});
