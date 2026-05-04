# Decisiones de Diseño y Políticas (Fase 4)

## 1. Estrategia de Token (Token Strategy)
- **Decisión**: Se implementará **Token-Exchange** para operaciones de mutación (escrituras) y **Pass-through** para operaciones de solo lectura.
- **Justificación**:
  - *Token-Exchange*: Es imperativo para writes (ej. `create_class`), ya que permite al orquestador solicitar a MS1 un token de corto tiempo de vida (short TTL), con la audiencia estrictamente limitada a MS2 (`aud: ms-academic`). Esto previene ataques de repetición y delimita los permisos exactamente a la acción en curso.
  - *Pass-through*: Para lectura pura (ej. `view_classes`), el orquestador simplemente reenviará el token original emitido por MS1. Esto ahorra latencia y carga de procesamiento en MS1.

## 2. Definición del RBAC
- **Decisión**: Se externalizarán las reglas de autorización en un archivo estático: `orchestrator/rbac_policy.json`.
- **Estructura**:
  - `actions`: Mapea la acción lógica requerida contra un array de roles permitidos. Ejemplo: `"create_class": ["PROFESOR", "ADMIN"]`.
  - `read_actions`: Define acciones que no requieren delegación o mutación, e.g., `"view_grades"`.
- **Reglas Especiales**:
  - El registro de profesores o la creación de cursos será estrictamente para `ADMIN` o `PROFESOR`.
  - Los alumnos pueden estar restringidos solo a `read_actions`.

## 3. Contrato del Orquestador
- **Endpoint**: El orquestador expondrá principalmente un endpoint de despacho genérico, e.g., `POST /orchestrator/action` o utilizará middlewares en rutas específicas.
- **Headers Esperados**:
  - `Authorization: Bearer <user_jwt_ms1>`: El JWT emitido por MS1 al usuario.
  - `X-Action`: Header requerido para identificar la acción (ej. `create_class`).
- **Validación JWT**:
  - Validará asíncronamente vía JWKS.
  - `issuer` esperado: `http://localhost:3001` (o URL de MS1 en prod).
  - `audience` esperado en el token inicial: `orchestrator`.

## 4. Observabilidad y Auditoría
- **Trazabilidad**: Se generará o extraerá un `X-Trace-Id` en el middleware inicial del orquestador, el cual será propagado en todas las peticiones hacia MS2 y hacia MS1.
- **Auditoría (Audit Logging)**: Se implementará un mecanismo *append-only* en disco mediante un archivo `audit.log` usando formato JSONL (JSON Lines).
  - Campos a guardar: `ts` (timestamp), `traceId`, `userId`, `action`, `outcome` (`success`, `forbidden`, `error`), `details`.

## Tareas Derivadas
- [x] Crear el archivo `rbac_policy.json`.
- [ ] Implementar el cliente para JWKS (`jose`) en Node.js para el scaffold (Fase 5).
- [ ] Proveer endpoint mock de Token-Exchange para MS1 (Fase 6).
