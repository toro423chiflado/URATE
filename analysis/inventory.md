# Descubrimiento e Inventario (Fase 1)

## 1. Identificación de carpetas y archivos principales
- **MS1 (auth)**: Ubicado en `ms-users/`. Archivos clave:
  - `package.json`
  - `Dockerfile`
  - `docker-compose.yml`
  - `README.md`
  - `src/services/jwt.service.js` (Firma de tokens)
- **MS2 (académico)**: Ubicado en `ms-academic/`. Archivos clave:
  - `pom.xml`
  - `Dockerfile`
  - `docker-compose.yml`
  - `README.md`
  - `src/main/java/pe/utec/academic/client/UserServiceClient.java` (Llamadas a MS1)

## 2. Inspección de uso de JWT y OAuth
- **MS1 (auth)**:
  - **Firma de tokens**: Utiliza la librería `jsonwebtoken` en `src/services/jwt.service.js`.
  - **Algoritmo**: Utiliza `HS256` por defecto, ya que se pasa un `JWT_SECRET` (string) como clave simétrica en `jwt.sign()`.
  - **Endpoint JWKS**: **NO EXISTE**. Al usar clave simétrica, no se está exponiendo una clave pública en un endpoint `/.well-known/jwks.json`.
  - **Token-Exchange**: No se observa un endpoint específico para token-exchange de delegación en este primer análisis.
- **MS2 (académico)**:
  - Valida el token o lo asume válido al reenviarlo a MS1, aunque tiene configurado `MS1_JWT_SECRET` en `.env.example`, lo que indica que posiblemente también intenta validarlo asumiendo clave simétrica `HS256`.

## 3. Claims relevantes del Token
Según `jwt.service.js` (MS1), el payload incluye los siguientes claims:
- `sub`: ID del usuario (`usuario.id`)
- `correo`: Correo del usuario (`usuario.correo`)
- `rol`: Rol del usuario (`usuario.rol`)
- `nombre`: Nombre del usuario (`usuario.nombre`)
- `apellido`: Apellido del usuario (`usuario.apellido`)
- *(No hay `aud`, `iss` explícitos ni `tenant` en la emisión inicial)*

## 4. Llamadas entre servicios
- **MS2 -> MS1**: `UserServiceClient.java` en MS2 realiza una petición HTTP GET saliente a `MS1_URL/usuarios/{id}` usando `WebClient`.
  - Reenvía el `Authorization: Bearer <token>` original.
  - Verifica si el usuario tiene `rol="PROFESOR"` antes de ciertas operaciones en MS2.

## 5. Secretos detectados en el repositorio
- **MS1 (`ms-users/`)**:
  - `docker-compose.yml` contiene secretos expuestos: `DATABASE_URL` y las claves simétricas `JWT_SECRET=utec_rate_secret_dev_2025` y `JWT_REFRESH_SECRET=utec_rate_refresh_dev_2025`.
- **MS2 (`ms-academic/`)**:
  - `.env.example` contiene secretos quemados y expuestos como `DB_ROOT_PASS=root_utec_2025`, `DB_PASS=utec_pass_2025`, y `MS1_JWT_SECRET=utec_rate_secret_dev_2025`.
  - `src/main/resources/application.yml` también tiene fallbacks hardcodeados de estos passwords.

## 6. Riesgos e Inconsistencias (Hallazgos Críticos)
- **HS256 vs RS256**: MS1 utiliza cifrado simétrico (`HS256`), lo que requiere que MS2 conozca la misma clave (`MS1_JWT_SECRET`) para validar la firma o que confíe ciegamente delegando la consulta a MS1. Esto es un antipatrón en arquitecturas con orquestador o API Gateway descentralizado.
- **Ausencia de JWKS**: No hay un endpoint para exponer claves públicas, lo que impide que un orquestador valide asíncronamente los tokens sin tener el secreto original quemado.
- **Secretos en código**: Múltiples claves (base de datos, JWT) están versionadas en el código (`docker-compose.yml`, `application.yml`, `.env.example`).
- **Falta de Audience (`aud`) e Issuer (`iss`)**: El token no emite claims de audiencia ni emisor, lo cual es riesgoso porque cualquier servicio podría usar el token en otro contexto sin restricción de scope.
