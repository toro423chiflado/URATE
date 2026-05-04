---
trigger: always_on
---

================================================================================
RULE OPERATIVA COMPLETA (Fase 1 en adelante)
Implementar un ORQUESTADOR entre MS1 (auth) y MS2 (académico)
Instrucciones: este bloque contiene TODO lo que el agente debe leer y ejecutar.
Es texto explicativo y operativo; el agente debe seguir cada sección en orden.
================================================================================

INTRODUCCIÓN / CONTEXTO
Importante MS1 = ms-users
Importante MS2 = ms-academic
- Propósito: Crear un microservicio "orchestrator/" que:
  1) valide JWT emitidos por MS1,
  2) aplique políticas RBAC por acción,
  3) orqueste llamadas seguras a MS2 (pass-through o token-exchange),
  4) registre auditoría y exponga health/metrics,
  5) incluya tests (unitarios, integración/E2E), Docker y CI.
- Supuesto: ya estás en la rama "orquestador" y el repo contiene las carpetas de MS1 y MS2.
- Entregables globales: carpeta "orchestrator/" completa, informes en "analysis/" y "design/",
  PR atómico en la rama "orquestador" con checklist completo.

--------------------------------------------------------------------------------
FASE 1 — DESCUBRIMIENTO E INVENTARIO (OUTPUT: analysis/inventory.md)
Objetivo: recopilar toda la información relevante sobre MS1 y MS2 para diseñar el orquestador.

Tareas que el agente debe realizar (análisis estático):
1. Identificar carpetas y archivos principales:
   - Ubicar la carpeta de MS1 (por ejemplo "ms-users" o similar).
   - Ubicar la carpeta de MS2 (por ejemplo "ms-academic" o similar).
   - Para cada microservicio anotar: package.json, Dockerfile, docker-compose.yml, README.
2. Inspeccionar uso de JWT y OAuth:
   - Buscar en el código dónde se firman los tokens (funciones con "sign", "jwt", "jose", "jsonwebtoken").
   - Detectar algoritmo de firma (RS256 o HS256).
   - Localizar si existe un endpoint JWKS público (/.well-known/jwks.json).
   - Identificar si existe un endpoint de token-exchange o similar en MS1.
3. Extraer claims relevantes:
   - Documentar qué claims incluye el token: sub, email, roles, aud, iss, iat, exp, tenant (si aplica).
4. Mapear llamadas entre servicios:
   - Buscar peticiones HTTP salientes desde MS1/MS2 (axios/fetch/request).
   - Identificar rutas protegidas en MS2 que el orquestador deberá llamar (p. ej. POST /classes).
5. Detectar secretos en repo:
   - Buscar archivos .env, .env.example, claves hardcoded, credenciales en código.
6. Escribir "analysis/inventory.md" con:
   - Lista de archivos clave, rutas descubiertas, esquema de claims, presencia/ausencia de JWKS,
     posibles puntos de integración (endpoints MS2), variables de entorno relevantes.
7. Marcar en el inventario cualquier inconsistencia o riesgo (ej.: HS256, no-JWKS, secrets).

Criterio de salida Fase 1: archivo analysis/inventory.md completado y commit con ese informe.

--------------------------------------------------------------------------------
FASE 2 — ANÁLISIS ESTÁTICO PROFUNDO Y RIESGOS (OUTPUT: analysis/static_report.md)
Objetivo: evaluar seguridad, contratos y dependencias.

Tareas:
1. Ejecutar auditorías de dependencias (en MS1 y MS2) y listar vulnerabilidades encontradas.
2. Revisar la implementación de la lógica de emisión de tokens en MS1:
   - Si HS256: recomendar migración a RS256 y plan para publicar JWKS.
   - Si RS256: verificar dónde/cómo se publica la clave pública o JWKS.
3. Analizar si MS2 valida tokens y con qué reglas (issuer, audience, JWKS).
4. Detectar exposición de secretos en el repo y recomendar moverlos a secret manager.
5. Preparar "analysis/static_report.md" con:
   - Resumen ejecutivo de riesgos,
   - Recomendaciones urgentes (ej.: publicar JWKS, no commitear .env),
   - Lista de endpoints que probablemente requieran cambios para integrarse.
6. Crear issues o listar PRs necesarios para MS1/MS2 (por ejemplo: "Agregar JWKS endpoint en MS1").

Criterio de salida Fase 2: static_report.md con recomendaciones y lista de acciones.

--------------------------------------------------------------------------------
FASE 3 — ANÁLISIS DINÁMICO / PRUEBAS LOCALES (OUTPUT: analysis/dynamic_report.md)
Objetivo: validar flujos con instancias reales o mocks y observar comportamiento en tiempo de ejecución.

Tareas:
1. Decidir entorno de pruebas:
   - Si MS1 y MS2 se pueden levantar en dev: levantarlos y ejecutar pruebas reales.
   - Si no: crear mocks mínimos:
     a) ms-users-mock: expone JWKS en /.well-known/jwks.json y un endpoint /oauth/token-exchange que devuelva un access_token simulado.
     b) ms-academic-mock: acepta POST /classes, imprime la cabecera Authorization y devuelve 201.
2. Generar claves RSA de desarrollo (dev) y crear JWKS asociado para el mock.
3. Probar escenarios manuales:
   - Generar JWT firmado con la private key dev (claims: sub, roles, aud=orchestrator, iss=http://ms-users:3000).
   - Enviar petición al orquestador (cuando esté levantado) con Authorization: Bearer <jwt> y X-Action: create_class.
4. Registrar en analysis/dynamic_report.md:
   - Respuestas observadas, headers recibidos por MS2 mock, logs del orquestador y del mock.
   - Fallos reproducidos (401, 403, 502) y su causa aparente.
5. Extraer información para el diseño (ej.: si MS2 requiere aud=ms-academic o acepta tokens de MS1 directamente).

Criterio de salida Fase 3: dynamic_report.md con evidencias y pasos reproducibles.

--------------------------------------------------------------------------------
FASE 4 — DECISIONES DE DISEÑO Y POLÍTICAS (OUTPUT: design/decision_log.md)
Objetivo: decidir estrategia token, RBAC y contrato de orquestación.

Tareas:
1. Elegir token strategy (registrar decisión y razones):
   - Opción A — Pass-through: reenviar JWT de usuario a MS2 (si MS2 confía en JWKS de MS1).
     - Uso: lecturas o operaciones que no requieren delegación.
   - Opción B — Token-exchange (recomendado para writes sensibles): orquestador solicita a MS1
     un token delegado con scope limitado y TTL corto, usa ese token para llamar MS2.
     - Uso: creación/actualización/eliminación de recursos, donde se necesita control y revocación.
2. Definir RBAC:
   - Crear archivo "orchestrator/rbac_policy.json" que mapee acciones lógicas a roles.
   - Ejemplo de estructura: actions: { "create_class": ["profesor","admin"], ... }, read_actions: ["view_grades"].
   - Registrar reglas especiales: registro de profesores sólo por admin, registro de alumnos vía Google.
3. Contrato del orquestador:
   - Definir que orquestador espera Authorization: Bearer <user_jwt_ms1> y header X-Action (o ruta dedicada).
   - Definir aud y issuer esperados en tokens.
4. Observabilidad y auditoría:
   - Trazabilidad: propagar X-Trace-Id en requests a MS2.
   - Auditoría: append-only JSONL (audit.log) con fields: ts, traceId, userId, action, outcome, details.
5. Documentar todas las decisiones en design/decision_log.md con justificación y tareas derivadas.

Criterio de salida Fase 4: decision_log.md con estrategia y PRs/issue list para MS1/MS2 si aplica.

--------------------------------------------------------------------------------
FASE 5 — SCAFFOLD E IMPLEMENTACIÓN (OUTPUT: carpeta orchestrator/)
Objetivo: crear el orquestador con los componentes obligatorios y commits atómicos.

Estructura mínima a crear:
- orchestrator/
  - package.json (dependencias: express, axios, jose, dotenv, pino; dev: jest, supertest)
  - .env.example (PORT, MS1_JWKS_URL, MS1_ISSUER, MS2_BASE_URL, ORCHESTRATOR_AUDIENCE, TOKEN_EXCHANGE_ENDPOINT, CLIENT_ID_ORCHESTRATOR, CLIENT_SECRET_ORCHESTRATOR, JWKS_CACHE_TTL)
  - .gitignore (node_modules, .env, logs)
  - rbac_policy.json
  - Dockerfile
  - docker-compose.orchestrator.yml (para integración con mocks o servicios reales)
  - README.md (cómo levantar y probar)
  - src/
    - index.js (server + routes: /health, /metrics, /orchestrator/action)
    - lib/
      - validateJwt.js (JWKS client + cache + jwt verification)
      - rbac.js (loader de rbac_policy.json y función isAllowed)
      - tokenExchange.js (cliente a TOKEN_EXCHANGE_ENDPOINT con client creds)
      - mapper.js (map action -> path de MS2)
      - auditLogger.js (appendAudit con JSONL)
  - test/
    - unit tests para rbac, mapper y validateJwt (mock JWKS)

Commits atómicos recomendados:
1) add package.json, .gitignore, .env.example, rbac_policy.json
2) add core app (src/index.js) + validateJwt + rbac
3) add tokenExchange, mapper, auditLogger
4) add unit tests
5) add Dockerfile + docker-compose + README

Contenido funcional esperado (descripciones, no código):
- validateJwt: debe validar firma mediante JWKS remoto (cache configurable), verificar issuer y audience y devolver payload claims.
- isAllowed: carga rbac_policy.json y determina si las roles del token permiten la acción.
- tokenExchange: si TOKEN_EXCHANGE_ENDPOINT configurado, solicitar token delegado con grant type token-exchange; si no, fallback a pass-through.
- mapper: traducir "create_class" -> "classes" etc.
- auditLogger: escribir una línea JSON por evento.
- index.js: recibir petición en /orchestrator/action, extraer token y action, validar JWT, comprobar RBAC, realizar token-exchange si corresponde, llamar a MS2, devolver respuesta, registrar auditoría, manejar errores con mapeo a 401/403/502.

Criterio de salida Fase 5: carpeta orchestrator/ comprometida en la rama "orquestador" con commits atómicos y mensajes claros.

--------------------------------------------------------------------------------
FASE 6 — PRUEBAS (OUTPUT: tests y reports)
Objetivo: validar funcionalidad con tests unitarios y E2E en entorno controlado.

Pruebas obligatorias:
1. Unit tests:
   - validateJwt: token válido, token expirado, issuer incorrecto, audience incorrecta, token sin roles.
   - rbac.isAllowed: casos positivos y negativos.
   - mapper: mappings y unknown action.
2. Integration/E2E:
   - Escenario A (mocks): levantar ms-users-mock (JWKS + token-exchange) y ms-academic-mock.
   - Casos E2E:
     a) Profesor (token válido con role "profesor") crea clase -> orquestador llama MS2 con token delegado o pass-through según diseño -> MS2 responde 201 -> orquestador responde 201 -> audit.log tiene entrada de éxito.
     b) Alumno intenta crear clase -> orquestador rechaza con 403 y escribe audit con forbidden.
     c) Token expirado -> 401.
     d) Token-exchange falla -> orquestador responde 502 y audit con error.
3. Verificación de datos:
   - Comprobar que MS2 mock recibe Authorization header tal como esperado (token delegado o user token).
   - Comprobar audit.log entries: correctos fields, timestamps y traceId.

Resultado esperado:
- Todos los tests unitarios deben pasar.
- Al menos 1 E2E exitoso que valide el flujo crítico (create_class por profesor).
- Documentar resultados en tests/e2e_report.md.

--------------------------------------------------------------------------------
FASE 7 — CI / CD (OUTPUT: .github/workflows/orchestrator-ci.yml)
Objetivo: integrar checks automáticos en cada PR/commit.

Pipeline mínimo sugerido:
- Lint
- Install dependencies (npm ci)
- Run unit tests
- Run npm audit (o Snyk scan)
- Optional: Integration job que use docker-compose para levantar mocks y ejecutar E2E (si el runner lo soporta)

PR template debe incluir:
- Resumen
- Cómo ejecutar localmente
- Tests incluidos
- Checklist de seguridad y QA

Criterio de salida: archivo de workflow en repo y PR con CI passing.

