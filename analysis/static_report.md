# Análisis Estático Profundo y Riesgos (Fase 2)

## 1. Resumen Ejecutivo
El análisis estático sobre MS1 (Auth) y MS2 (Académico) revela vulnerabilidades moderadas en las dependencias de Node.js, pero más importante aún, identifica riesgos críticos en la arquitectura de autenticación actual y en la gestión de secretos. El uso de cifrado simétrico (HS256) para los JWT y la exposición de secretos en el código fuente son los problemas más urgentes a mitigar antes de que el orquestador pueda operar de manera segura.

## 2. Evaluación de Dependencias
- **MS1 (`ms-users`)**: Tras ejecutar `npm audit`, se detectaron **10 vulnerabilidades** (2 de severidad baja, 8 de severidad moderada). Principalmente asociadas a librerías secundarias (como versiones antiguas de `uuid` requeridas por dependencias de Google/Firebase).
  - *Acción recomendada*: Ejecutar `npm audit fix` y actualizar `firebase-admin` si es posible.
- **MS2 (`ms-academic`)**: Al ser un proyecto Java/Maven, se recomienda encarecidamente integrar e invocar el plugin OWASP Dependency-Check (`mvn org.owasp:dependency-check-maven:check`) en el pipeline de CI para auditar posibles CVEs en el pom.xml.

## 3. Lógica de Emisión y Validación de Tokens
- **MS1 (Emisión con HS256)**: MS1 emite tokens utilizando una clave simétrica compartida (`JWT_SECRET`).
  - **Riesgo**: El uso de `HS256` implica que cualquier servicio que necesite verificar la firma del token también debe poseer la misma clave secreta, rompiendo el principio de menor privilegio.
  - **Plan de Migración (Urgente)**: Migrar a firmas asimétricas (`RS256`). MS1 debe generar un par de claves RSA, usar la clave privada para firmar, y exponer la clave pública a través de un endpoint estándar de la industria: `GET /.well-known/jwks.json`.
- **MS2 (Validación actual)**: Actualmente, MS2 no verifica criptográficamente la firma del JWT. En su lugar, el `UserServiceClient` reenvía el token a MS1 para autenticarse y consultar los detalles del usuario (`GET /usuarios/{id}`).
  - **Riesgo**: Genera alto acoplamiento y exceso de latencia/tráfico hacia MS1 por cada petición.
  - **Impacto del Orquestador**: Una vez que el orquestador implemente la validación de JWT asíncrona vía JWKS y realice el Token-Exchange o pass-through, MS2 deberá dejar de depender de MS1 para la validación sincrónica y en su lugar validar el JWT delegado del orquestador mediante el mismo JWKS de MS1.

## 4. Exposición de Secretos
Se han detectado los siguientes secretos versionados en el repositorio:
- `MS1_JWT_SECRET`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `DB_PASS`, `DB_ROOT_PASS`, `POSTGRES_PASSWORD`
- **Archivos afectados**: `docker-compose.yml`, `ms-academic/.env.example`, `ms-academic/src/main/resources/application.yml`.
- **Recomendación Urgente**: Eliminar los secretos hardcodeados de los archivos de código. Inyectar variables desde un Secret Manager (e.g., HashiCorp Vault, AWS Secrets Manager) en el pipeline de despliegue (CI/CD) o usar archivos `.env` (sin commitear) de forma estrictamente local.

## 5. Lista de Acciones Requeridas (Issues / PRs)
Se deben levantar los siguientes tickets para los equipos encargados de MS1 y MS2:

### Para el equipo de MS1 (ms-users):
1. **[ISSUE] Migrar firmas JWT de HS256 a RS256**: Reemplazar la firma simétrica actual por una firma asimétrica.
2. **[ISSUE] Implementar endpoint JWKS**: Crear y exponer el endpoint `GET /.well-known/jwks.json` con la clave pública activa.
3. **[ISSUE] Implementar endpoint de Token-Exchange**: Crear ruta para aceptar un access token válido y emitir un token delegado con scope limitado (audiencia específica de MS2).
4. **[ISSUE] Limpiar secretos en código**: Eliminar variables sensibles de `docker-compose.yml`.

### Para el equipo de MS2 (ms-academic):
1. **[ISSUE] Limpieza de Secretos**: Remover contraseñas y secretos de `.env.example` y `application.yml`.
2. **[ISSUE] Desacoplamiento de Validación**: Preparar a MS2 para confiar en los tokens delegados recibidos por el orquestador, validando directamente contra el JWKS (en un futuro cercano) y eliminando las llamadas síncronas al endpoint `/usuarios/{id}` de MS1.
