const { createRemoteJWKSet, jwtVerify } = require('jose');

const JWKS_URL = process.env.MS1_JWKS_URL;
const ISSUER   = process.env.MS1_ISSUER;

if (!JWKS_URL) throw new Error('MS1_JWKS_URL no configurado');

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

async function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer:     ISSUER,
      algorithms: ['RS256'],
    });
    req.usuario = payload;
    next();
  } catch (err) {
    if (err.code === 'ERR_JWT_EXPIRED') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Roles permitidos: ${roles.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = { verifyJWT, checkRole };
