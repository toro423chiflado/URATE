# ms-analytics

Ingesta de datos para URATE con estrategia **pull 100%** de registros por microservicio.

Estructura base alineada a la rubrica:

- 3 contenedores Docker Python (uno por microservicio).
- Carga de archivos CSV/JSON a bucket S3.
- Insumos para catalogo en AWS Glue.
- Consultas y vistas para AWS Athena.
- Documento base para diagrama Entidad/Relacion del data catalog.

## Estructura

```text
ms-analytics/
  containers/
    ingest-users/
    ingest-content/
    ingest-reviews/
  aws/
    glue/
    athena/
  docs/
    er/
```

## Flujo de despliegue sugerido

1. Build de cada contenedor.
2. Push de imagenes a Docker Hub.
3. Pull de imagenes desde la MV "ingesta" en AWS.
4. Ejecucion de jobs de ingesta por cron/systemd/docker compose.

## Nota

Cada contenedor tiene su propio `Dockerfile`, `requirements.txt` y script `src/main.py` para que puedas publicarlos por separado.
