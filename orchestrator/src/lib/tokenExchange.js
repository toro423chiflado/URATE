const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN_EXCHANGE_ENDPOINT = process.env.TOKEN_EXCHANGE_ENDPOINT;
const CLIENT_ID = process.env.CLIENT_ID_ORCHESTRATOR;
const CLIENT_SECRET = process.env.CLIENT_SECRET_ORCHESTRATOR;

async function exchangeToken(subjectToken, targetAudience) {
  // If not configured, fallback to pass-through
  if (!TOKEN_EXCHANGE_ENDPOINT) {
    return subjectToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
    params.append('subject_token', subjectToken);
    params.append('subject_token_type', 'urn:ietf:params:oauth:token-type:access_token');
    params.append('audience', targetAudience);

    const response = await axios.post(TOKEN_EXCHANGE_ENDPOINT, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });

    return response.data.access_token;
  } catch (error) {
    // If we get an error during token exchange, it's a security risk to pass-through
    throw new Error('Token exchange failed');
  }
}

module.exports = { exchangeToken };
