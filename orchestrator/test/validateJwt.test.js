const { validateJwt } = require('../src/lib/validateJwt');
const crypto = require('crypto');
const jose = require('jose');
const fs = require('fs');

describe('Validate JWT Module', () => {
  let privateKey;
  let expiredToken;
  let validToken;

  beforeAll(async () => {
    if (fs.existsSync('./dev-private.pem')) {
      const pkcs8 = fs.readFileSync('./dev-private.pem', 'utf8');
      privateKey = await jose.importPKCS8(pkcs8, 'RS256');

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
        .setExpirationTime('-1h') // expired
        .sign(privateKey);
    }
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
