# MS2 — ms-academic

Microservicio académico de **UTEC Rate**.
Gestiona Carreras, Cursos y asignación Profesor–Curso.
**Consume MS1** para validar que un usuario tiene rol PROFESOR.

---

## ¿Qué necesitas instalado en tu laptop?

| Herramienta | Para qué | Descarga |
|---|---|---|
| **Docker Desktop** | Correr MySQL + el microservicio sin instalar Java ni MySQL | [docker.com/desktop](https://www.docker.com/products/docker-desktop/) |
| **Postman** | Probar los endpoints (como un "cliente HTTP visual") | [postman.com](https://www.postman.com/downloads/) |

> Con solo Docker Desktop y Postman puedes probar todo. No necesitas instalar Java, Maven ni MySQL.

---

## Levantar el MS2 en local (paso a paso)

### Paso 1 — Clona o copia el proyecto

```bash
# Si tienes el tar.gz descargado:
tar -xzf ms-academic.tar.gz
cd ms-academic
```

### Paso 2 — Levanta MySQL + ms-academic con Docker

```bash
docker compose up -d --build
```

Esto hace automáticamente:
- Descarga MySQL 8 y lo levanta en el puerto `3306`
- Compila el proyecto Java con Maven (tarda ~2 min la primera vez)
- Crea las tablas en la BD con JPA
- Inserta los datos del seed (`data.sql`): 6 carreras, ~27 cursos, 10 asignaciones

### Paso 3 — Verificar que esté corriendo

```bash
# Ver logs en tiempo real
docker compose logs -f ms-academic

# Cuando veas esto, está listo:
# Started MsAcademicApplication in X.XXX seconds
```

También puedes abrir en el navegador:
- **`http://localhost:3002/health`** → debe responder `{ "status": "ok" }`
- **`http://localhost:3002/docs`** → Swagger UI interactivo

### Paso 4 — Detener

```bash
docker compose down          # detiene pero conserva los datos
docker compose down -v       # detiene y borra la BD (datos frescos)
```

---

## Conectar a MySQL (opcional, para ver la BD)

Si quieres ver las tablas directamente:

**Opción A — DBeaver** (recomendado, gratis):
1. Descarga [dbeaver.io](https://dbeaver.io/download/)
2. Nueva conexión → MySQL
3. Host: `localhost` · Puerto: `3306` · BD: `academic_db`
4. Usuario: `root` · Contraseña: `root`

**Opción B — TablePlus** (también gratis con límites):
1. Descarga [tableplus.com](https://tableplus.com)
2. Nueva conexión → MySQL con los mismos datos

**Opción C — Terminal dentro del contenedor**:
```bash
docker exec -it utec_academic_db mysql -uroot -proot academic_db
```
```sql
-- Ver carreras
SELECT * FROM carrera;

-- Ver cursos de Cursos Generales
SELECT c.nombre, c.codigo, c.creditos, ca.nombre as carrera
FROM curso c
JOIN carrera ca ON c.carrera_id = ca.id
WHERE ca.codigo = 'CG';

-- Ver asignaciones
SELECT pc.id, pc.profesor_id, c.nombre as curso, pc.semestre, pc.seccion
FROM profesor_curso pc
JOIN curso c ON pc.curso_id = c.id;
```

---

## Probar con Postman

### Importar la colección

1. Abre Postman
2. Clic en **Import** (arriba a la izquierda)
3. Arrastra el archivo `ms-academic.postman_collection.json`
4. La colección aparece con todas las requests listas

### Variables de la colección

En Postman, haz clic en los `...` de la colección → **Edit** → **Variables**:

| Variable | Valor | Descripción |
|---|---|---|
| `base_url` | `http://localhost:3002` | URL del MS2 |
| `token` | (vacío por ahora) | JWT del MS1 para endpoints protegidos |

### Secuencia recomendada de pruebas

**Sin token (endpoints públicos):**

```
1. Health Check              GET /health
2. Listar carreras           GET /carreras
3. Cursos de CG              GET /carreras/1/cursos
4. Cursos de IS              GET /carreras/2/cursos
5. Buscar cursos             GET /cursos?q=calculo
6. ¿Existe prof-curso ID=1? GET /profesor-curso/1/existe
```

**Con token del MS1 (endpoints que enriquecen con datos de profesor):**

```
7. Inicia sesión en MS1:
   POST http://localhost:3001/auth/google
   (o usa el token que ya tienes del login)

8. Copia el accessToken y pégalo en la variable `token` de Postman

9. Profesores del curso 1    GET /cursos/1/profesores
   → Devuelve la asignación con nombre "—" porque los UUIDs del seed son fake
   → En producción con UUIDs reales de MS1 devuelve nombre y foto del profesor

10. Cursos del profesor fake  GET /profesores/00000000-0000-0000-0000-000000000001/cursos
```

---

## Datos del seed (lo que viene cargado)

### Carreras (6)
| ID | Código | Nombre |
|---|---|---|
| 1 | CG | Cursos Generales |
| 2 | IS | Ingeniería de Sistemas de Información |
| 3 | IC | Ingeniería Civil |
| 4 | II | Ingeniería Industrial |
| 5 | CC | Ciencias de la Computación |
| 6 | AND | Administración y Negocios Digitales |

### Cursos Generales (los compartidos por todas las carreras)
`CG-MA101` Cálculo I · `CG-MA102` Cálculo II · `CG-MA103` Álgebra Lineal
`CG-FI101` Física I · `CG-FI102` Física II · `CG-QU101` Química General
`CG-HU101` Comunicación · `CG-HU201` Ética · `CG-MA201` Estadística · `CG-EC101` Economía

### Asignaciones de prueba (profesor_curso)
Los 10 registros usan UUIDs fake (`00000000-...-000001`, etc.).
Para probar con profesores reales, usa el endpoint **POST /profesor-curso** con el UUID
del profesor obtenido del MS1.

---

## Endpoints disponibles

| Método | Ruta | Token | Descripción |
|---|---|---|---|
| GET | /health | No | Health check |
| GET | /docs | No | Swagger UI |
| GET | /carreras | No | Listar carreras activas |
| GET | /carreras/:id | No | Carrera por ID |
| POST | /carreras | Sí | Crear carrera |
| PUT | /carreras/:id | Sí | Actualizar carrera |
| DELETE | /carreras/:id | Sí | Desactivar carrera |
| GET | /cursos | No | Listar cursos (paginado, filtros) |
| GET | /carreras/:id/cursos | No | Cursos de una carrera |
| GET | /cursos/:id | No | Curso por ID |
| POST | /cursos | Sí | Crear curso |
| PUT | /cursos/:id | Sí | Actualizar curso |
| DELETE | /cursos/:id | Sí | Desactivar curso |
| GET | /cursos/:id/profesores | Sí | Profesores de un curso (enriquecido MS1) |
| GET | /profesores/:id/cursos | Sí | Cursos de un profesor |
| GET | /profesor-curso/:id | Sí | Asignación por ID |
| GET | /profesor-curso/:id/existe | No | Verifica si existe (para MS4) |
| POST | /profesor-curso | Sí | Asignar profesor a curso (valida en MS1) |
| DELETE | /profesor-curso/:id | Sí | Desactivar asignación |

---

## Solución de problemas frecuentes

**El contenedor no inicia / error de compilación Maven:**
```bash
docker compose logs ms-academic
# Si hay error de Java, revisa que el Dockerfile use eclipse-temurin:17
```

**MySQL no arranca (puerto 3306 ocupado):**
```bash
# Verifica si tienes MySQL instalado localmente corriendo en ese puerto
# Opción: cambia el puerto en docker-compose.yml:
ports:
  - "3307:3306"   # cambia 3306 por 3307 en tu laptop
# Y en DB_URL cambia 3306 por 3307
```

**El seed no se ejecuta (tablas vacías):**
```bash
# Entra a MySQL y verifica
docker exec -it utec_academic_db mysql -uroot -proot academic_db -e "SELECT COUNT(*) FROM carrera;"
# Si devuelve 0, el data.sql no corrió. Verifica application.yml:
# spring.sql.init.mode=always
```

**Las llamadas a MS1 devuelven "—" en nombre del profesor:**
Esto es normal con los UUIDs fake del seed. Para ver datos reales:
1. Levanta el MS1 en `http://localhost:3001`
2. El MS2 lo llama automáticamente en `host.docker.internal:3001`
