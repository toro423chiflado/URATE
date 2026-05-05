require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const materialesRoutes    = require('./routes/materiales.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');

const app  = express();
const PORT = process.env.PORT || 3004;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ms-content',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/materiales',    materialesRoutes);
app.use('/inscripciones', inscripcionesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`\nms-content corriendo en puerto ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
