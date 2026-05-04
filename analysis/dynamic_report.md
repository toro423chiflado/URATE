# Análisis Dinámico y Pruebas Locales (Fase 3)

## 1. Entorno de Pruebas y Mocks
Debido a que MS1 requiere cambios mayores para emitir tokens RS256 con JWKS, se optó por generar un entorno de pruebas con **mocks mínimos** que simulan el comportamiento objetivo:
- **ms-users-mock**: Simula un MS1 actualizado que expone el endpoint `/.well-known/jwks.json` y permite el intercambio de tokens (`/oauth/token-exchange`).
- **ms-academic-mock**: Simula MS2 recibiendo una solicitud (ej. `POST /classes`) del orquestador, y respondiendo un 201 exitoso tras inspeccionar que recibe un JWT válido delegado.

## 2. Generación de Claves (RSA/JWKS)
Se generó un par de claves RSA 2048-bit localmente (`dev-private.pem` y `jwks.json`) asignando el identificador `kid: dev-key-1`. Esto permite que el orquestador simule la validación asíncrona de firmas antes de interactuar con MS2.

## 3. Pruebas y Escenarios Observados
Se probaron los siguientes flujos utilizando peticiones manuales con tokens JWT firmados con `dev-private.pem` (incluyendo claims `sub`, `roles`, `aud=orchestrator`, y `iss=http://ms-users:3000`):

1. **Escenario Ideal (Token Válido, Acción Permitida)**:
   - Request: `GET /orchestrator/action` con `Authorization: Bearer <valid_jwt>` y `X-Action: create_class`.
   - Comportamiento esperado: El orquestador lee y valida el JWKS. El RBAC permite a `profesor` ejecutar `create_class`. El orquestador ejecuta el exchange y llama a MS2 con el token delegado.
   - Respuesta observada (mock): `201 Created`. Header de MS2 muestra `Authorization: Bearer <delegated_token>`.

2. **Escenario de Rol Denegado (RBAC)**:
   - Request: Mismo endpoint, pero JWT emitido para rol `alumno`.
   - Respuesta observada: `403 Forbidden` retornado inmediatamente por el orquestador sin contactar a MS2. Registro de auditoría `forbidden` generado.

3. **Escenario Token Expirado o Inválido**:
   - Request: JWT con fecha expirada o alterado.
   - Respuesta observada: `401 Unauthorized`. La validación falla en la capa `jose`/JWT.

4. **Escenario Falla de MS2**:
   - Comportamiento: Si `ms-academic-mock` devuelve un 500, el orquestador mapea la respuesta y propaga `502 Bad Gateway` al cliente.

## 4. Extracción de Información para el Diseño
- **Validación del MS2**: Para que el orquestador funcione correctamente, el MS2 real deberá actualizarse para confiar en los tokens delegados. MS2 deberá leer el mismo `jwks.json` en lugar de llamar síncronamente al endpoint `GET /usuarios/{id}` en MS1.
- **Flujo de Exchange**: Queda validado que el modelo **Token-Exchange** es idóneo para operaciones de mutación (`create_class`), otorgándole al token delegado un scope y audience muy reducidos (`aud=ms-academic`).
