const express = require('express');
const crypto = require('crypto');
const { validateJwt } = require('./lib/validateJwt');
const { isAllowed } = require('./lib/rbac');
const { exchangeToken } = require('./lib/tokenExchange');
const { mapActionToPath } = require('./lib/mapper');
const { appendAudit } = require('./lib/auditLogger');
const axios = require('axios');
const dotenv = require('dotenv');

const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MS2_BASE_URL = process.env.MS2_BASE_URL || 'http://localhost:3002';

// Middleware to inject traceId
app.use((req, res, next) => {
  req.traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  next();
});

app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));
app.get('/metrics', (req, res) => res.status(200).json({ status: 'OK' }));

app.post('/orchestrator/action', async (req, res) => {
  const { traceId } = req;
  const authHeader = req.headers.authorization;
  const action = req.headers['x-action'] || req.body.action;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Validate JWT (Signature, Issuer, Audience, Expiry)
    const claims = await validateJwt(token);
    const userId = claims.sub || 'unknown';

    // 2. Check RBAC
    const roles = Array.isArray(claims.roles) ? claims.roles : [claims.rol];
    if (!isAllowed(action, roles)) {
      appendAudit({ traceId, userId, action, outcome: 'forbidden', details: 'Role not allowed' });
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 3. Map action to MS2 endpoint
    const ms2PathInfo = mapActionToPath(action);
    if (!ms2PathInfo) {
      appendAudit({ traceId, userId, action, outcome: 'error', details: 'Unknown action' });
      return res.status(400).json({ error: 'Unknown action' });
    }

    // 4. Token Exchange (if it's a write action)
    let tokenForMs2 = token;
    if (ms2PathInfo.requiresExchange) {
      try {
        tokenForMs2 = await exchangeToken(token, 'ms-academic');
      } catch (err) {
        appendAudit({ traceId, userId, action, outcome: 'error', details: 'Token exchange failed' });
        return res.status(502).json({ error: 'Bad Gateway: Token exchange failed' });
      }
    }

    // 5. Call MS2
    try {
      const ms2Response = await axios({
        method: ms2PathInfo.method,
        url: `${MS2_BASE_URL}${ms2PathInfo.path}`,
        data: req.body.data || {},
        headers: {
          'Authorization': `Bearer ${tokenForMs2}`,
          'X-Trace-Id': traceId
        }
      });

      appendAudit({ traceId, userId, action, outcome: 'success', details: `MS2 status ${ms2Response.status}` });
      return res.status(ms2Response.status).json(ms2Response.data);

    } catch (ms2Err) {
      const status = ms2Err.response ? ms2Err.response.status : 502;
      appendAudit({ traceId, userId, action, outcome: 'error', details: `MS2 error ${status}` });
      return res.status(status).json({ error: 'Error calling MS2' });
    }

  } catch (error) {
    appendAudit({ traceId, userId: 'unknown', action, outcome: 'error', details: error.message });
    return res.status(401).json({ error: 'Unauthorized: ' + error.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Orchestrator listening on port ${PORT}`);
  });
}

module.exports = app;
