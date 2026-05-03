const { createRemoteJWKSet, jwtVerify, importJWK } = require('jose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const JWKS_URL = process.env.MS1_JWKS_URL;
const ISSUER = process.env.MS1_ISSUER;
const AUDIENCE = process.env.ORCHESTRATOR_AUDIENCE;

let jwks;
if (JWKS_URL) {
  try {
    jwks = createRemoteJWKSet(new URL(JWKS_URL), {
      cacheMaxAge: parseInt(process.env.JWKS_CACHE_TTL || '3600000', 10)
    });
  } catch(e) {
    // URL invalid or mock scenario
  }
}

/**
 * Validates the given JWT.
 * Falls back to local dev-key-1 if testing locally without remote JWKS.
 */
async function validateJwt(token) {
  let keyToUse = jwks;

  // Fallback for local mocks/testing if jwks.json is present locally
  if (!keyToUse && fs.existsSync('./jwks.json')) {
    const localJwks = JSON.parse(fs.readFileSync('./jwks.json'));
    keyToUse = await importJWK(localJwks.keys[0], 'RS256');
  }

  if (!keyToUse) {
    throw new Error('No valid JWKS available');
  }

  const options = {};
  if (ISSUER) options.issuer = ISSUER;
  if (AUDIENCE) options.audience = AUDIENCE;

  try {
    const { payload } = await jwtVerify(token, keyToUse, options);
    return payload;
  } catch (error) {
    throw new Error('JWT Validation Failed: ' + error.message);
  }
}

module.exports = { validateJwt };
