# Checklist de Seguridad y Operaciones (Fase 8)

Este documento detalla las prácticas de seguridad y la preparación operativa implementadas o recomendadas antes del paso a producción del orquestador.

## 1. Gestión de Secretos (Secrets Management)
- [x] **No versionar secretos**: Asegurarse de que `.env` está en el `.gitignore`.
- [x] **Secretos en CI/CD**: Los pipelines (como GitHub Actions) deben inyectar secretos desde GitHub Secrets y no desde archivos persistidos.
- [ ] **Secret Manager en Producción**: Implementar HashiCorp Vault, AWS Secrets Manager o Azure Key Vault para inyectar `MS1_JWKS_URL`, `CLIENT_SECRET_ORCHESTRATOR`, etc. en el entorno de despliegue.

## 2. Caching de JWKS y Resiliencia
- [x] **TTL Configurable**: La función `validateJwt.js` utiliza la librería `jose` con soporte de caché para JWKS (`cacheMaxAge` configurado vía `JWKS_CACHE_TTL`, por defecto 1 hora).
- [x] **Fallback Local**: En entornos de desarrollo, la librería cae en un `jwks.json` local en caso de que el remoto sea inaccesible, previniendo cuellos de botella por caída del MS1.

## 3. Tokens (TTL y Revocación)
- [x] **Tokens Cortos (Access Tokens)**: Los tokens delegados emitidos mediante *Token-Exchange* deben tener un tiempo de vida (TTL) muy corto (e.g. 5 a 15 minutos).
- [ ] **Revocación**: Implementar revocación a nivel de Refresh Tokens en MS1. Para invalidar Access Tokens instantáneamente en casos críticos, MS1 debería emitir una *Deny List* (o *Revocation List*) que el orquestador consulte (quizá en Redis) o forzar una rotación de JWKS.

## 4. Auditoría (Auditing)
- [x] **Log de Auditoría Seguro**: Se ha implementado `audit.log` (JSON Lines) en modalidad *append-only* a nivel de aplicación usando `pino`.
- [ ] **Almacenamiento Inmutable**: En producción, los logs deben redirigirse (vía `stdout`/FluentBit/Filebeat) a un sistema centralizado de solo lectura o almacenamiento inmutable (ej. Amazon S3 con versioning u Opensearch/Elasticsearch).

## 5. Seguridad en Tránsito (Transport Security)
- [ ] **TLS End-to-End**: Todo el tráfico que atraviese la VPC (hacia MS1 y MS2) debe estar cifrado. El Gateway público debe terminar TLS (HTTPS).
- [ ] **mTLS (Mutual TLS)**: Recomendado para comunicaciones internas (Orquestador -> MS2 y Orquestador -> MS1) en producción usando un service mesh (ej. Istio o Linkerd) para evitar suplantaciones entre pods.

## 6. Rate Limiting y Protección contra DDoS
- [ ] **WAF Externo**: Colocar el orquestador detrás de un WAF (e.g., Cloudflare, AWS WAF).
- [ ] **Rate Limiting Interno**: Añadir un middleware (ej. `express-rate-limit` con Redis) en el orquestador para prevenir abusos a nivel de aplicación (brute-force a endpoints sensibles).

## 7. Vulnerabilidades en Dependencias
- [x] **Auditoría Inicial**: Se ejecutó `npm audit`. El proyecto `orchestrator` se instaló desde cero y se encuentra sin vulnerabilidades ("found 0 vulnerabilities").
- [ ] **Auditoría Continua**: El pipeline `Orchestrator CI` en GitHub Actions incluye un chequeo automatizado (`npm audit --audit-level=high`) para detener merges si se introducen vulnerabilidades críticas en el futuro.
