# Reporte de Pruebas E2E (Fase 6)

## 1. Unit Tests
Se implementaron y ejecutaron con éxito las pruebas unitarias usando `jest` para los siguientes módulos core del orquestador:
- **`mapper.test.js`**: Verifica la traducción correcta de acciones abstractas (e.g. `create_class`) hacia rutas y métodos HTTP de MS2, además de la necesidad de token-exchange. (PASS)
- **`rbac.test.js`**: Verifica que roles como `PROFESOR` pueden ejecutar `create_class`, mientras que a un `ALUMNO` se le deniega. Valida también los `read_actions`. (PASS)
- **`validateJwt.test.js`**: Verifica la correcta decodificación y validación de firma asimétrica de tokens usando el paquete `jose` y un `jwks.json` local/mock. Pruebas de expiración también resultaron exitosas. (PASS)

*Comando ejecutado*: `npm test` - (3 test suites passed, 11 tests passed).

## 2. Escenarios E2E (Integración Local Simulada)
Se validaron los flujos críticos (E2E) descritos en los requerimientos usando la infraestructura de MS1 y MS2 simulada en la Fase 3:

### Caso A: Profesor crea una clase (Éxito)
- **Actor**: Usuario con rol `PROFESOR`.
- **Acción**: `X-Action: create_class`
- **Flujo**:
  1. Orquestador recibe la petición y el JWT.
  2. Valida la firma del JWT exitosamente.
  3. RBAC valida que el rol `PROFESOR` está permitido para `create_class`.
  4. Orquestador inicia el token-exchange hacia MS1 simulado y recibe el token delegado (`aud: ms-academic`).
  5. Orquestador propaga la petición a MS2 (`POST /classes`) inyectando el token delegado y el `X-Trace-Id`.
  6. MS2 responde HTTP 201.
  7. Orquestador reenvía HTTP 201 al cliente y registra auditoría exitosa.
- **Resultado**: PASSED.

### Caso B: Alumno intenta crear una clase (Rechazo RBAC)
- **Actor**: Usuario con rol `ALUMNO`.
- **Acción**: `X-Action: create_class`
- **Flujo**:
  1. JWT es válido criptográficamente.
  2. RBAC detecta que el array de roles (`["ALUMNO"]`) no intercepta con los roles requeridos (`["PROFESOR", "ADMIN"]`).
  3. Orquestador devuelve inmediatamente HTTP 403.
  4. Auditoría captura el evento de `forbidden`.
- **Resultado**: PASSED.

### Caso C: Token Expirado (401)
- **Actor**: Cualquiera.
- **Flujo**: El JWT incluye el claim `exp` en el pasado. La capa de validación `jose` arroja `JWTExpired`. El middleware general captura el error y devuelve `401 Unauthorized`.
- **Resultado**: PASSED.

### Caso D: Token-Exchange falla (502)
- **Actor**: Usuario con rol válido.
- **Flujo**: Si el endpoint de Token-Exchange está inalcanzable o devuelve error, el orquestador aborta y responde con `502 Bad Gateway`, capturando el error en el archivo de logs.
- **Resultado**: PASSED.

## 3. Verificación de Auditoría
El archivo `audit.log` fue generado correctamente en formato JSON Lines, con los campos requeridos (`ts`, `traceId`, `userId`, `action`, `outcome`, `details`).
