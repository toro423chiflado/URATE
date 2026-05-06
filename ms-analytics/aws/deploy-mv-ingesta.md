# MV ingesta - guia rapida

## 1) Build y push a Docker Hub

```bash
docker build -t <dockerhub_user>/urate-ingest-users:1.0.0 ./containers/ingest-users
docker build -t <dockerhub_user>/urate-ingest-content:1.0.0 ./containers/ingest-content
docker build -t <dockerhub_user>/urate-ingest-reviews:1.0.0 ./containers/ingest-reviews

docker push <dockerhub_user>/urate-ingest-users:1.0.0
docker push <dockerhub_user>/urate-ingest-content:1.0.0
docker push <dockerhub_user>/urate-ingest-reviews:1.0.0
```

## 2) Pull en la MV de AWS

```bash
docker pull <dockerhub_user>/urate-ingest-users:1.0.0
docker pull <dockerhub_user>/urate-ingest-content:1.0.0
docker pull <dockerhub_user>/urate-ingest-reviews:1.0.0
```

## 3) Ejecutar contenedores

```bash
docker run --rm --env-file .env.users <dockerhub_user>/urate-ingest-users:1.0.0
docker run --rm --env-file .env.content <dockerhub_user>/urate-ingest-content:1.0.0
docker run --rm --env-file .env.reviews <dockerhub_user>/urate-ingest-reviews:1.0.0
```
