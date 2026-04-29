# Cómo arreglar los errores de compilación

## El problema

Tienes archivos con **nombres incorrectos** en tu carpeta local que duplican clases:

```
UsuarioDto_m1.java       ← DEBE eliminarse (el correcto es UsuarioMs1Dto.java)
Recursonoencontrado.java ← DEBE eliminarse (el correcto es ResourceNotFoundException.java)
```

Java exige que el nombre del archivo coincida exactamente con el nombre de la clase pública.

## Solución: 3 pasos

### Paso 1 — Borra los archivos con nombre incorrecto

En tu carpeta `ms-academic/src/main/java/pe/utec/academic/`:

```
dto/UsuarioDto_m1.java              ← BORRAR
exception/Recursonoencontrado.java  ← BORRAR
```

En Windows (PowerShell):
```powershell
Remove-Item "src\main\java\pe\utec\academic\dto\UsuarioDto_m1.java"
Remove-Item "src\main\java\pe\utec\academic\exception\Recursonoencontrado.java"
```

En Mac/Linux:
```bash
rm src/main/java/pe/utec/academic/dto/UsuarioDto_m1.java
rm src/main/java/pe/utec/academic/exception/Recursonoencontrado.java
```

### Paso 2 — Reemplaza con los archivos de este zip

Extrae el zip y copia/reemplaza TODOS los archivos de `src/` y `pom.xml`.
Los archivos correctos son los de este paquete.

### Paso 3 — Vuelve a construir

```bash
# Borra la imagen anterior para forzar recompilación limpia
docker rmi utec_ms_academic 2>/dev/null || true

# Construye y levanta
docker compose up -d --build

# Ver logs
docker compose logs -f ms-academic
```

Cuando veas `Started MsAcademicApplication` → ¡compiló correctamente!

---

## Conectar MS2 con tu MS1 real

### Tu MS1 corre en puerto 3001 con:
- `JWT_SECRET=utec_rate_secret_dev_2025`
- Endpoint: `GET /usuarios/:id` → requiere `Authorization: Bearer TOKEN`

### Configuración (archivo `.env` del MS2):

```env
# MS1 corriendo en Docker en tu laptop
MS1_URL=http://host.docker.internal:3001
MS1_MOCK=false
MS1_JWT_SECRET=utec_rate_secret_dev_2025
```

### Verificar que MS2 llama a MS1 correctamente:

1. Levanta el MS1 primero:
```bash
cd microservicio_auth-main
docker compose up -d
# Espera a que esté listo: docker compose logs -f ms-users
```

2. Levanta el MS2:
```bash
cd ms-academic
docker compose up -d --build
```

3. Haz login en MS1 para obtener un token:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@utec.edu.pe","password":"admin123"}'
```
Copia el `accessToken` de la respuesta.

4. Úsalo en MS2 para ver profesores de un curso:
```bash
curl http://localhost:3002/cursos/1/profesores \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

Si el MS1 está corriendo → devuelve nombre real del profesor.
Si el MS1 no está corriendo → devuelve nombre "—" (graceful fallback).

---

## Flujo completo: cómo MS2 llama a MS1

```
Frontend → POST http://localhost:3002/cursos/1/profesores
              Header: Authorization: Bearer TOKEN_DEL_MS1
                           ↓
           ProfesorCursoController.java
           extrae el Bearer token del header
                           ↓
           ProfesorCursoService.java
           consulta MySQL → lista de ProfesorCurso
                           ↓
           UserServiceClient.java (por cada profesor)
           → GET http://utec_ms_users:3001/usuarios/UUID
             Header: Authorization: Bearer TOKEN_DEL_MS1
                           ↓
           MS1 verifica el token y devuelve:
           { id, nombre, apellido, correo, rol, foto }
                           ↓
           MS2 combina datos MySQL + datos MS1
           → Respuesta enriquecida con nombre y foto del profesor
```

---

## Endpoints del MS2 listos para probar

| URL | Descripción | Token |
|-----|-------------|-------|
| GET /health | Estado del servicio | No |
| GET /docs | Swagger UI | No |
| GET /carreras | 16 carreras UTEC | No |
| GET /carreras/1/cursos | Cursos Generales | No |
| GET /carreras/2/cursos | Cursos de SI | No |
| GET /cursos?q=calculo | Buscar cursos | No |
| GET /cursos/1/profesores | Profesores de Cálculo I | Sí (MS1) |
| GET /profesor-curso/1/existe | Verificar asignación | No |
| POST /profesor-curso | Nueva asignación | Sí (ADMIN) |
