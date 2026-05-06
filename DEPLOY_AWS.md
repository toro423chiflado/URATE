# 🚀 URATE — Guía de Deploy en AWS (Cloud9 Ubuntu 22)

## Arquitectura de 3 Máquinas Virtuales

```
Internet ──► API Gateway (HTTPS) ──► MV1 (nginx:80) ──► ms-users:3001
                                                      ──► ms-academic:3002
                                  ──► MV2 (nginx:80) ──► ms-reviews:3003
                                                      ──► ms-content:3004
                                                      ──► ms-analytics:3005
                              MV3 (privada, sin acceso público)
                                  ──► PostgreSQL:5432
                                  ──► MySQL:3306
                                  ──► MongoDB:27017
```

---

## PASO 1 — Crear las 3 EC2 en AWS Academy

1. Ve a **EC2 → Launch Instance**
2. Elige **Ubuntu Server 22.04 LTS**
3. Tipo: **t3.medium** (recomendado) o t2.micro para pruebas
4. **Configura el Security Group**:

| MV  | Descripción       | Puerto entrada | Fuente            |
|-----|-------------------|---------------|-------------------|
| MV1 | Backend A         | 22 (SSH)      | Tu IP             |
| MV1 |                   | 80 (HTTP)     | 0.0.0.0/0         |
| MV2 | Backend B         | 22 (SSH)      | Tu IP             |
| MV2 |                   | 80 (HTTP)     | 0.0.0.0/0         |
| MV3 | Bases de datos    | 22 (SSH)      | Tu IP             |
| MV3 |                   | 5432,3306,27017| IP privada MV1,MV2|

> **MV3 NO debe tener puertos de BD abiertos al público.**

5. Anota las **IPs privadas** de cada MV (ej: 10.0.1.x)

---

## PASO 2 — Instalar Docker en cada MV (repetir en MV1, MV2 y MV3)

```bash
# Conectarse a cada MV via SSH
ssh -i tu_key.pem ubuntu@IP_PUBLICA_MVx

# Instalar Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
newgrp docker

# Instalar Docker Compose
sudo apt-get install -y docker-compose-plugin
docker compose version   # verificar

# Instalar git
sudo apt-get install -y git curl
```

---

## PASO 3 — MV3: Levantar Bases de Datos

```bash
# En MV3
git clone https://github.com/TU_REPO/URATE.git
cd URATE

# Crear .env con passwords seguros
cp .env.example .env
nano .env   # editar passwords

# Levantar SOLO las BDs
docker compose -f docker-compose.db.yml up -d

# Verificar
docker compose -f docker-compose.db.yml ps
docker logs utec_auth_db   # PostgreSQL
docker logs utec_academic_db  # MySQL
docker logs utec_reviews_db   # MongoDB
```

### Ejecutar seed de MongoDB (20,000+ registros)
```bash
docker exec utec_reviews_db mongosh reviews_db --eval "db.stats()"
# O desde la app después de levantarla
```

---

## PASO 4 — MV1 y MV2: Levantar Microservicios

```bash
# En MV1 (y repetir en MV2 para redundancia)
git clone https://github.com/TU_REPO/URATE.git
cd URATE

# Crear .env apuntando a MV3
cp .env.example .env
nano .env
# Editar DB_HOST=IP_PRIVADA_MV3
# Completar AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, etc.

# Construir y levantar microservicios
docker compose build
docker compose up -d

# Ver logs
docker compose logs -f
docker compose ps
```

### Ejecutar seeds
```bash
# Seed MongoDB (desde ms-reviews)
docker exec utec_ms_reviews python seed.py

# El seed de MySQL se ejecuta automáticamente desde data.sql
# El seed de PostgreSQL se ejecuta via Prisma desde ms-users
docker exec utec_ms_users npx prisma db seed
```

---

## PASO 5 — Configurar AWS API Gateway (HTTPS público)

1. Ve a **API Gateway → Create API → HTTP API**
2. Tipo: **HTTP API**
3. En **Integrations**, añade:

| Ruta                    | Integración              |
|-------------------------|--------------------------|
| `ANY /api/v1/auth/{proxy+}` | HTTP_PROXY → http://MV1_IP/api/v1/auth/{proxy} |
| `ANY /api/v1/usuarios/{proxy+}` | HTTP_PROXY → http://MV1_IP/api/v1/usuarios/{proxy} |
| `ANY /api/v1/carreras/{proxy+}` | HTTP_PROXY → http://MV1_IP/api/v1/carreras/{proxy} |
| `ANY /api/v1/cursos/{proxy+}` | HTTP_PROXY → http://MV1_IP/api/v1/cursos/{proxy} |
| `ANY /api/v1/calificaciones/{proxy+}` | HTTP_PROXY → http://MV2_IP/api/v1/calificaciones/{proxy} |
| `ANY /api/v1/repositorios/{proxy+}` | HTTP_PROXY → http://MV2_IP/api/v1/repositorios/{proxy} |
| `ANY /api/v1/content/{proxy+}` | HTTP_PROXY → http://MV2_IP/api/v1/content/{proxy} |
| `ANY /api/v1/analytics/{proxy+}` | HTTP_PROXY → http://MV2_IP/api/v1/analytics/{proxy} |

4. Deploy → copia la URL pública (ej: `https://abc123.execute-api.us-east-1.amazonaws.com`)

---

## PASO 6 — Configurar AWS Glue y Athena (Data Science)

### Crear bucket S3
```bash
aws s3 mb s3://utecrate-analytics-data --region us-east-1
aws s3api put-bucket-policy --bucket utecrate-analytics-data --policy '{
  "Version":"2012-10-17",
  "Statement":[{"Effect":"Allow","Principal":{"Service":"glue.amazonaws.com"},"Action":"s3:*","Resource":"arn:aws:s3:::utecrate-analytics-data/*"}]
}'
```

### Ejecutar ingesta inicial
```bash
# Llama al endpoint POST /ingest/all
curl -X POST https://TU_API_GW/api/v1/ingest/all \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

### Configurar AWS Glue Crawler
1. Ve a **Glue → Crawlers → Create Crawler**
2. Data source: `s3://utecrate-analytics-data/usuarios/`
3. Repite para `cursos/` y `calificaciones/`
4. Database: `utecrate`
5. Run el crawler → crea las tablas automáticamente

### Validar con Athena
```sql
-- En Athena, seleccionar base de datos "utecrate"
SELECT * FROM usuarios LIMIT 10;
SELECT * FROM cursos LIMIT 10;
SELECT COUNT(*) FROM calificaciones;
```

---

## PASO 7 — Verificar todo

```bash
# Health de todos los servicios
curl https://TU_API_GW/api/v1/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@utec.edu.pe","password":"admin123"}'

# Listar carreras
curl https://TU_API_GW/api/v1/carreras/
```

---

## Comandos útiles

```bash
# Ver todos los contenedores
docker compose ps

# Reiniciar un servicio
docker compose restart ms-reviews

# Ver logs de un microservicio
docker compose logs -f ms-academic

# Detener todo
docker compose down

# Reconstruir un servicio tras cambios
docker compose build ms-reviews && docker compose up -d ms-reviews
```

---

## URLs Swagger de cada microservicio

| Microservicio | URL Swagger (local) |
|---------------|---------------------|
| MS1 - Users   | http://MV1_IP:3001/docs |
| MS2 - Academic| http://MV1_IP:3002/docs (o /swagger-ui.html) |
| MS3 - Reviews | http://MV2_IP:3003/docs |
| MS4 - Content | http://MV2_IP:3004/docs |
| MS5 - Analytics| http://MV2_IP:3005/docs |

