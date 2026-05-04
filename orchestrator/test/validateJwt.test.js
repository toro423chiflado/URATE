process.env.MS1_JWKS_URL = 'http://localhost:3001/.well-known/jwks.json';
const { validateJwt } = require('../src/lib/validateJwt');
const crypto = require('crypto');
const jose = require('jose');
const fs = require('fs');
const nock = require('nock');

const MS1_URL = 'http://localhost:3001';

describe('Validate JWT Module', () => {
  let privateKey;
  let expiredToken;
  let validToken;

  beforeAll(async () => {
    // Generate a fresh key for the test to be independent
    const { publicKey: testPub, privateKey: testPriv } = await jose.generateKeyPair('RS256');
    privateKey = testPriv;
    const jwk = await jose.exportJWK(testPub);
    jwk.kid = 'dev-key-1';
    jwk.alg = 'RS256';
    jwk.use = 'sig';

    // Mock the JWKS endpoint
    nock(MS1_URL)
      .persist()
      .get('/.well-known/jwks.json')
      .reply(200, { keys: [jwk] });

    validToken = await new jose.SignJWT({ sub: '123', roles: ['PROFESOR'] })
      .setProtectedHeader({ alg: 'RS256', kid: 'dev-key-1' })
      .setIssuedAt()
      .setIssuer('http://localhost:3001')
      .setAudience('orchestrator')
      .setExpirationTime('2h')
      .sign(privateKey);

    expiredToken = await new jose.SignJWT({ sub: '123' })
      .setProtectedHeader({ alg: 'RS256', kid: 'dev-key-1' })
      .setIssuedAt()
      .setIssuer('http://localhost:3001')
      .setAudience('orchestrator')
      .setExpirationTime('-1h')
      .sign(privateKey);
  });

  it('should validate a valid token', async () => {
    if (!validToken) return; // skip if keys not generated
    const payload = await validateJwt(validToken);
    expect(payload.sub).toBe('123');
    expect(payload.roles).toContain('PROFESOR');
  });

  it('should throw error on expired token', async () => {
    if (!expiredToken) return;
    await expect(validateJwt(expiredToken)).rejects.toThrow();
  });

  it('should throw error on invalid token', async () => {
    await expect(validateJwt('invalid.token.here')).rejects.toThrow();
  });
});
