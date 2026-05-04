const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../../keys/private.pem'), 'utf8');
const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../../keys/jwks.json'), 'utf8'); // Not directly usable by jsonwebtoken easily
const PUB_PEM = crypto.createPublicKey(PRIVATE_KEY).export({ type: 'spki', format: 'pem' });

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY  = '8h';
const REFRESH_EXPIRY = '7d';
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const ISSUER = process.env.JWT_ISSUER || 'http://localhost:3001';
const AUDIENCE = process.env.JWT_AUDIENCE || 'orchestrator';

/**
 * Genera access token (8h) y refresh token (7d)
 */
async function generarTokens(usuario) {
  const payload = {
    sub:  usuario.id,
    correo: usuario.correo,
    rol:  usuario.rol,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
  };

  const accessToken = jwt.sign(payload, PRIVATE_KEY, { 
    algorithm: 'RS256', 
    expiresIn: ACCESS_EXPIRY,
    keyid: 'utec-rate-key-1',
    issuer: ISSUER,
    audience: AUDIENCE
  });

  const rawRefresh  = crypto.randomBytes(64).toString('hex');
  const expiresAt   = new Date(Date.now() + REFRESH_EXPIRY_MS);

  await prisma.refreshToken.create({
    data: {
      usuarioId: usuario.id,
      token:     rawRefresh,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: rawRefresh };
}

/**
 * Rota el refresh token: revoca el viejo y emite uno nuevo
 */
async function rotarRefreshToken(rawToken) {
  const registro = await prisma.refreshToken.findUnique({
    where:   { token: rawToken },
    include: { usuario: true },
  });

  if (!registro)               throw new Error('Refresh token no encontrado');
  if (registro.revocado)       throw new Error('Refresh token ya revocado');
  if (registro.expiresAt < new Date()) throw new Error('Refresh token expirado');

  // Revocar el token viejo
  await prisma.refreshToken.update({
    where: { id: registro.id },
    data:  { revocado: true },
  });

  return generarTokens(registro.usuario);
}

/**
 * Revoca todos los refresh tokens del usuario (logout)
 */
async function revocarTodos(usuarioId) {
  await prisma.refreshToken.updateMany({
    where: { usuarioId, revocado: false },
    data:  { revocado: true },
  });
}

/**
 * Verifica un access token y devuelve el payload
 */
function verificarAccessToken(token) {
  return jwt.verify(token, PUB_PEM, { 
    algorithms: ['RS256'],
    issuer: ISSUER,
    audience: AUDIENCE
  });
}

module.exports = { generarTokens, rotarRefreshToken, revocarTodos, verificarAccessToken };
