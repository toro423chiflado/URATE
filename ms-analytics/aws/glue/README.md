# AWS Glue

Base para el catalogo de datos por archivo en S3.

## Recomendacion

- Crear una base de datos Glue: `urate_analytics`.
- Crear un crawler por microservicio (o por prefijo de tabla) apuntando a:
  - `s3://<bucket>/raw/users/`
  - `s3://<bucket>/raw/content/`
  - `s3://<bucket>/raw/reviews/`
- Programar crawler despues de cada ingesta (o por horario).

## Convencion de tablas

`<servicio>_<tabla_origen>`

Ejemplo:

- `users_users`
- `content_courses`
- `reviews_reviews`
