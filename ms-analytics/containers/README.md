# Contenedores de ingesta

Cada carpeta representa un job de ingesta independiente para un microservicio:

- `ingest-users`
- `ingest-content`
- `ingest-reviews`

Todos usan el mismo patron:

1. Conexion al origen (DB del microservicio).
2. `SELECT *` por cada tabla definida.
3. Generacion de archivo `csv` o `json`.
4. Upload al bucket S3.
