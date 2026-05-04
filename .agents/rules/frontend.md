---
trigger: always_on
---

================================================================================
RULE OPERATIVA COMPLETA (Fase 1 → entrega frontend + orquestador + validación manual)
Objetivo: Entregar un frontend básico (web-frontend/) que use MS-USERS (Auth) para login
con Google, obtenga JWTs con roles, y realice acciones a través del ORQUESTADOR que a su vez
redirige a MS2. MS2 valida roles a partir del JWT (sin tabla de usuarios propia).
Este bloque es la "rule" que el agente debe leer y ejecutar paso a paso. Es texto operativo.
================================================================================

CONTEXTO GLOBAL
- MS-USERS (Auth / MS1): operativo y con .env correctamente configurado. Emite JWT con claim "roles".
- ORQUESTADOR: implementado; valida JWT y aplica RBAC; expone endpoint principal: POST /orchestrator/action.
- MS2 (Académico): no tiene tabla de usuarios; validará roles a partir del JWT firmado por MS1.
- Objetivo final: que un usuario Admin pueda crear profesores desde el frontend, que un Profesor pueda crear clases vía orquestador, y que un Alumno sea bloqueado al intentar operaciones restringidas.

================================================================================
REGLA CENTRAL (actualizada) — VALIDACIÓN EN MS2
--------------------------------------------------------------------------------
- MS2 (Académico) NO mantiene usuarios ni roles en su BD.
- MS2 debe validar la firma del JWT usando la JWKS pública de MS1 (MS-USERS).
- MS2 debe verificar claims críticos: issuer (iss), audience (aud) y exp.
- MS2 debe extraer claim "roles" del payload y aplicar autorización (p. ej. solo role "admin" puede actualizar carrera).
- El anotado @Operation(summary = "solo ADMIN") en Swagger es documental; la autorización real la debe hacer el middleware que verifica el JWT/roles.
- El ORQUESTADOR sigue siendo el primer filtro (valida token) pero MS2 también debe validar firmemente para evitar confiar en headers externos sin firma.
--------------------------------------------------------------------------------

INSTRUCCIONES GENERALES PARA EL AGENTE (RESUMEN)
1. Crear carpeta web-frontend/ (React + Vite recomendado).
2. Implementar login Google -> enviar id_token a MS-USERS -> recibir JWT MS1.
3. Guardar JWT en navegador (preferir cookie httpOnly si MS1 lo setea).
4. Frontend llama ORQUESTADOR con Authorization: Bearer <JWT> y header X-Action adecuado.
5. ORQUESTADOR valida JWT y aplica RBAC; si permite, envía petición a MS2 incluyendo el token (pass-through) o token delegado (token-exchange) según diseño.
6. MS2 valida el JWT con JWKS de MS1 y autoriza en base al claim roles.
7. Realizar pruebas manuales mediante UI; validar audit.log en ORQUESTADOR y DB entries en MS-USERS.

================================================================================
DETALLE PASO A PASO (SECUENCIA PARA EJECUTAR)
--------------------------------------------------------------------------------
FASE 1 — PREPARACIÓN DEL FRONTEND (web-frontend/)
- Objetivo: proporcionar UI para login y acciones por rol.

Tareas:
1. Scaffold:
   - Crear proyecto con Vite + React (carpeta web-frontend/).
   - Estructura: src/pages (Login, Dashboard, AdminPanel, ProfessorPanel, StudentPanel), src/components (Header, ProtectedRoute), src/services (auth.js, api.js), public/.
2. Variables de entorno (.env.local.example):
   - VITE_GOOGLE_CLIENT_ID=...
   - VITE_MS1_URL=http://localhost:3001
   - VITE_ORCHESTRATOR_URL=http://localhost:3000
3. Dependencias (referencia a instalar): axios, react-router-dom, jose (opcional para decode), jwt-decode (opcional).
4. CORS: confirmar que MS1 y ORQUESTADOR permiten origen del frontend (http://localhost:5173).

FASE 2 — BOOTSTRAP ADMIN (Seed en MS-USERS)
- Crear script de seed en ms-users (scripts/seed-admin.js) o SQL que inserte un usuario con role 'admin'.
- Conectar usando DATABASE_URL y ejecutar el script en ambiente dev.
- Verificar en la DB que el usuario existe.

FASE 3 — LOGIN/INTERCAMBIO CON MS-USERS (UX + lógica)
- Frontend Login:
  - Botón Google Sign-In.
  - Obtener id_token de Google (Google Identity Services o Firebase).
  - POST al endpoint MS1 (ej. /auth/google) con { id_token }.
- MS-USERS:
  - Valida id_token con Google/Firebase.
  - Crea usuario si no existe (role default: alumno).
  - Retorna JWT firmado por MS1 con claim roles (ej. roles: ["admin"]).
  - Opcional: set-cookie httpOnly con token; si NO, frontend guarda en localStorage.
- Frontend:
  - Almacenar token (preferir cookie httpOnly si MS1 lo setea).
  - Decodificar localmente (solo para UI) para mostrar menus según role.

FASE 4 — FRONTEND: PANELES Y FUNCIONES (por rol)
- ProtectedRoute: comprueba existencia de token; si no existe, redirige a /login.
- Dashboard:
  - Mostrar email y roles.
  - Mostrar botones condicionales:
    - Admin -> "Crear usuario" (admin/profesor).
    - Profesor -> "Crear clase".
    - Alumno -> ver clases.
- AdminPanel:
  - Formulario: email, name, role.
  - Llamada: POST a MS1 admin endpoint (ej. /admin/create-user) o a ORQUESTADOR con X-Action: create_user (según diseño); incluir Authorization Bearer <JWT-admin>.
  - Mostrar resultado y mensajes de error.
- ProfessorPanel:
  - Formulario: title, description.
  - Llamada: POST ORQUESTADOR /orchestrator/action con header X-Action: create_class y Authorization Bearer <JWT-profesor>.
  - Mostrar success/failure.
- StudentPanel:
  - Listar clases (GET via ORQUESTADOR).
  - Intentar crear clase muestra UI/permiso denegado; backend debe devolver 403.

FASE 5 — CLIENTE API Y FLUJOS (frontend ↔ orquestador)
- services/api.js:
  - Instanciar axios con baseURL = VITE_ORCHESTRATOR_URL.
  - Interceptor request: añadir Authorization: Bearer <JWT> si existe.
  - Funciones: createClass(payload) -> POST /orchestrator/action (body payload) con header X-Action: create_class.
- Mapeo X-Action ↔ rutas MS2: asegurarse que ORQUESTADOR traduzca X-Action a path MS2.

FASE 6 — MS2: AJUSTES PARA VALIDACIÓN JWT (REGLA APLICADA)
- MS2 debe tener middleware JWT validator que:
  - Descargue JWKS de MS1 (configurar MS1_JWKS_URL en MS2 env).
  - Verifique firma, issuer y audience.
  - Extraiga claim roles.
  - Autorice endpoints según roles (ej. updateCarrera -> solo "admin").
- Especificaciones:
  - Cache JWKS con TTL configurable.
  - En caso de failure en verificación -> responder 401.
  - En caso de falta de permiso -> 403.
- Importante: MS2 debe aceptar peticiones solo desde ORQUESTADOR en producción (network policies) OR exigir verificación JWT robusta; no confiar en headers sin firma.

FASE 7 — ORQUESTADOR: CONFIRMACIONES
- Confirmar que ORQUESTADOR:
  - Valida JWT (issuer+audience+exp) y que payload incluye roles.
  - Aplica RBAC usando rbac_policy.json.
  - Decide pass-through vs token-exchange por acción (usar pass-through si MS2 valida JWKS).
  - Agrega traceId y registra auditoría (audit.log JSONL) con fields: ts, traceId, userId, action, outcome, details.
  - Retorna códigos adecuados (401, 403, 502...).

FASE 8 — DESPLIEGUE LOCAL LIGERO (manual testing)
- Opciones para levantar:
  1) Ejecutar localmente:
     - Levantar Postgres (si MS-USERS lo requiere).
     - Ejecutar ms-users (npm run dev) — ya con .env configurado.
     - Ejecutar orchestrator (npm run dev).
     - Ejecutar ms-academic (o mock) (npm run dev).
     - Ejecutar web-frontend (npm run dev).
  2) Docker-compose (opcional): docker-compose.full.yml con servicios: db, ms-users, orchestrator, ms-academic, web-frontend.
- Verificar CORS y que los puertos match.

FASE 9 — PRUEBAS MANUALES OBLIGATORIAS (validación final)
- Paso 1: Loguear como Admin (usar email del seed) en frontend.
  - Confirmar acceso a AdminPanel.
- Paso 2: Crear profesor desde AdminPanel.
  - Confirmar que ms-users creó el usuario (check DB).
- Paso 3: Loguear como Profesor (credenciales creadas).
  - Ir a ProfessorPanel -> Crear clase.
  - Verificar que ORQUESTADOR acepta request y MS2 recibe la petición (revisar logs MS2).
  - Verificar audit.log en ORQUESTADOR tiene entry success con traceId y userId.
- Paso 4: Loguear como Alumno -> intentar crear clase.
  - Verificar ORQUESTADOR responde 403 y audit.log registra forbidden.
- Paso 5: Verificar MS2 rechaza si recibe JWT inválido o sin roles (401/403).
- Paso 6: Revisar que MS2 no requiere tabla de usuarios y que la autorización se basa en JWT roles correctos.

FASE 10 — DOCUMENTACIÓN, COMMIT Y PR
- Archivos a incluir en PR:
  - web-frontend/ (README con variables .env.local, pasos para dev).
  - scripts/seed-admin.js (o seeds).
  - docker-compose.full.yml (si creado).
  - documentation: quick start, cómo probar manualmente, endpoints relevantes.
- Mensajes recomendados:
  - feat(frontend): add web-frontend scaffold and Google login
  - feat(frontend): add admin panel and professor panel
  - chore(ms-users): add seed-admin script
  - docs: add run instructions and testing guide
- Checklist en PR:
  - [ ] MS-USERS .env no fue modificado en el PR
  - [ ] Token flows verificados manualmente
  - [ ] Audit.log entries comprobadas
  - [ ] .env.local.example agregado en frontend
  - [ ] No secrets commitados

CONSIDERACIONES DE SEGURIDAD (imprescindible)
- Nunca exponer Firebase private key en frontend. Solo MS-USERS debe tener la private key.
- Preferir cookie httpOnly para token si MS-USERS puede setearla. Si se usa localStorage, documentar riesgos.
- Habilitar CORS solo para origenes necesarios (frontend dev host).
- MS2 y ORQUESTADOR deben validar JWT (no confiar en headers) y usar HTTPS en prod.
- Revisar logs por tokens expirados y token-exchange fails.

RESPUESTAS A CASOS ESPECÍFICOS
- ¿Está bien que MS2 tenga @Operation("solo ADMIN") y no tabla de admins?
  - Sí, siempre que MS2 valide el JWT firmado por MS1 y verifique el claim roles.
  - En producción, restringir llamadas directas a MS2 solo desde ORQUESTADOR mediante políticas de red o mTLS para mitigar spoofing.

CRITERIO DE ACEPTACIÓN (final)
- Se puede iniciar sesión con Google -> MS-USERS devuelve JWT con roles.
- Desde frontend, Admin crea Profesor usando endpoint protegido.
- Profesor crea clase vía ORQUESTADOR -> MS2 recibe y procesa petición.
- Alumno es bloqueado al intentar acción de Profesor.
- Audit.log del ORQUESTADOR contiene entradas para cada intento/acción con traceId y resultado.

================================================================================