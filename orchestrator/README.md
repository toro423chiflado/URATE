# Orchestrator Microservice

Este microservicio actúa como un API Gateway seguro y Orquestador de peticiones entre MS1 (Auth) y MS2 (Académico).

## Características
1. **Validación JWT**: Verifica firmas usando RS256/JWKS.
2. **RBAC**: Aplica control de acceso basado en roles por acción.
3. **Token Exchange**: Intercambia tokens largos por tokens delegados de corto alcance para operaciones seguras en MS2.
4. **Auditoría**: Genera logs en formato JSONL (`audit.log`) con `traceId`.

## Requisitos Previos
- Node.js >= 18
- NPM

## Instalación
```bash
npm install
```

## Configuración
Copia el archivo `.env.example` a `.env` y configura los valores (por defecto apunta a los mocks en el puerto 3001 y 3002).

## Ejecución Local
```bash
npm run dev
```

## Pruebas (Tests)
Para ejecutar las pruebas unitarias:
```bash
npm test
```

## Docker
Para levantar el orquestador con Docker Compose:
```bash
docker-compose -f docker-compose.orchestrator.yml up -d
```
