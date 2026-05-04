const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function run() {
  const keysDir = path.join(__dirname, '../keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
  }

  console.log('⏳ Generando par de llaves RSA (2048 bits)...');
  
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

  // Convertir PEM a JWK (Simplificado para RS256)
  const pubKeyObject = crypto.createPublicKey(publicKey);
  const jwk = pubKeyObject.export({ format: 'jwk' });
  
  const jwks = {
    keys: [
      {
        ...jwk,
        kid: 'utec-rate-key-1',
        use: 'sig',
        alg: 'RS256',
      }
    ]
  };

  fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
  fs.writeFileSync(path.join(keysDir, 'jwks.json'), JSON.stringify(jwks, null, 2));

  console.log('✅ Llaves generadas en ms-users/keys/');
  console.log('   - private.pem (Para firmar tokens)');
  console.log('   - jwks.json   (Para exponer en el endpoint público)');
}

run();
