const https = require('https');
const axios = require('axios');

function createApiClient(token) {
  const baseURL =
    process.env.API_BASE_URL ||
    `http://localhost:${process.env.PORT || 5000}/api`;

  const isHttps = /^https:/i.test(baseURL);

  const instance = axios.create({
    baseURL,
    timeout: 15000,
    ...(isHttps
      ? { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }
      : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return instance;
}

module.exports = { createApiClient };
