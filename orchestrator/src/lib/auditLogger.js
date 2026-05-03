const fs = require('fs');
const path = require('path');
const pino = require('pino');

const LOG_FILE = path.join(__dirname, '../../audit.log');

// Utilizando stream de appendFileSync para asegurar persistencia
// En producción, pino puede mandar directo a stdout o un logger central.
const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
}, pino.destination({ dest: LOG_FILE, sync: false })); // async writing for better perf, sync if strictly needed

function appendAudit(event) {
  const { traceId, userId, action, outcome, details } = event;
  const logEntry = {
    traceId,
    userId,
    action,
    outcome,
    details
  };
  
  logger.info(logEntry);
}

module.exports = { appendAudit };
