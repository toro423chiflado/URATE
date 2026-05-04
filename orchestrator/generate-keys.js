const crypto = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

const pubKeyObj = crypto.createPublicKey(publicKey);
const jwk = pubKeyObj.export({ format: 'jwk' });
jwk.kid = 'dev-key-1';
jwk.use = 'sig';

const jwks = { keys: [jwk] };

fs.writeFileSync('dev-private.pem', privateKey);
fs.writeFileSync('jwks.json', JSON.stringify(jwks, null, 2));

console.log('Keys generated successfully');
