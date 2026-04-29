# UTEC Rate — MS1 + MS2 juntos

## Estructura de carpetas requerida

```
URATE/
├── docker-compose.yml          ← este archivo (raíz)
├── ms-users/         ← carpeta del MS1 (git clone)
│   ├── Dockerfile              ← reemplazar con Dockerfile-ms1
│   ├── entrypoint.sh           ← copiar aquí
│   ├── package.json
│   ├── prisma/
│   └── src/
└── ms-academic/                ← carpeta del MS2 (git clone)
    ├── Dockerfile
    ├── pom.xml
    └── src/
```

---

## Pasos para levantar todo desde cero

### 1 — Clona los repositorios

```bash
cd URATE

# MS1
git clone https://github.com/TU-USUARIO/microservicio_auth.git microservicio_auth

# MS2
git clone https://github.com/TU-USUARIO/ms-academic.git ms-academic
```


### 3 — Levanta todo con un solo comando

```bash
# Desde la carpeta URATE/
docker compose up -d --build
```

### 4 — Verificar que todo está corriendo y ejecutar la seed

```bash
docker ps
docker exec -it utec_ms_users npm install @faker-js/faker --no-save
docker exec -it utec_ms_users node prisma/seed.js
docker exec -i utec_academic_db mysql -uutec_user -putec_pass_2025 academic_db < ms-academic/src/main/resources/data.sql
```

Debes ver 4 contenedores `Up`:
- `utec_auth_db` (PostgreSQL)
- `utec_academic_db` (MySQL)
- `utec_ms_users` (MS1 en puerto 3001)
- `utec_ms_academic` (MS2 en puerto 3002)

---

## URLs disponibles

| Servicio | URL |
|---|---|
| MS1 Swagger | http://localhost:3001/docs |
| MS1 Health | http://localhost:3001/health |
| MS2 Swagger | http://localhost:3002/docs |
| MS2 Health | http://localhost:3002/health |

---

## Credenciales de prueba

| Rol | Correo | Password |
|---|---|---|
| ADMIN | admin@utec.edu.pe | admin123 |
| PROFESOR | juan.perez@utec.edu.pe | profesor123 |
| ESTUDIANTE | maria.garcia@utec.edu.pe | estudiante123 |

---

## Probar la integración MS1 → MS2

### En PowerShell:

```powershell
$r = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -ContentType "application/json" -Body '{"correo":"admin@utec.edu.pe","password":"admin123"}'
$token = $r.accessToken
echo $token
---

## Conectar DBeaver

### MySQL (MS2):
| Campo | Valor |
|---|---|
| Host | localhost |
| Port | 3306 |
| Database | academic_db |
| Usuario | utec_user |
| Password | utec_pass_2025 |

### PostgreSQL (MS1):
| Campo | Valor |
|---|---|
| Host | localhost |
| Port | 5432 |
| Database | auth_db |
| Usuario | postgres |
| Password | postgres |

---

## Parar

```bash
docker compose down        # para pero conserva datos
docker compose down -v     # para y borra todo
```
