# Plan de Despliegue y Rollout (Fase 9)

Este plan describe la estrategia para poner en producción el Orquestador entre MS1 y MS2 con cero downtime y minimizando riesgos.

## 1. Fase Staging (Pre-producción)
- **Despliegue**: Desplegar el orquestador en el entorno de staging utilizando la misma configuración de infraestructura que producción.
- **Configuración Inicial**:
  - `MS1_JWKS_URL` y `TOKEN_EXCHANGE_ENDPOINT` apuntando al MS1 de staging.
  - `MS2_BASE_URL` apuntando al MS2 de staging.
- **Validación**:
  - Ejecutar la suite de pruebas E2E automatizadas contra staging.
  - El equipo QA debe probar flujos críticos (ej. creación de clases y consulta de notas).
  - Validar que MS2 procese correctamente los tokens delegados en staging (Token-Exchange funcionando).

## 2. Fase Canary (Producción)
- **Lanzamiento Canary (5%)**:
  - Desplegar el Orquestador en el clúster de producción.
  - Configurar el Load Balancer / Ingress Controller (ej. NGINX o AWS ALB) para desviar un **5%** del tráfico destinado a MS2 a través del nuevo Orquestador.
  - Mantener el 95% restante fluyendo por los canales actuales (si los hubiera) o MS1 directamente.
- **Observación Continua**:
  - Monitorizar durante 24-48 horas en este estado.
- **Incremento (Rollout)**:
  - Si los *Service Level Indicators (SLIs)* se mantienen estables, subir al 25% -> 50% -> 100%.

## 3. Monitoreo y Alertas
El orquestador emite métricas a través de sus endpoints `/metrics` y `audit.log`.
- **Métricas a recolectar (Prometheus/Datadog)**:
  - Latencia promedio (`p95` y `p99`) del endpoint `/orchestrator/action`.
  - Tasa de éxito (*Success Rate*) vs Códigos de Error (4xx, 5xx).
  - Fallos específicos en `tokenExchange`.
- **Alertas a configurar (PagerDuty/Slack)**:
  - `High_TokenExchange_Failure`: Si >1% de las peticiones a MS1 para token-exchange fallan en una ventana de 5 mins.
  - `High_MS2_5xx_Errors`: Si MS2 devuelve >2% de errores 5xx a través del orquestador.
  - `Spike_401_Unauthorized`: Aumento abrupto en rechazos por JWT inválidos (posible problema con la caché de JWKS o ataque).

## 4. Plan de Rollback Automático
- **Condiciones de Rollback (Thresholds)**:
  - Si la tasa general de errores (`error rate` 5xx) supera el **2%** durante más de 5 minutos continuos.
  - Si la latencia promedio del orquestador supera los **300ms** prolongadamente, afectando la experiencia de usuario.
- **Acción de Rollback**:
  - El Ingress Controller debe revertir inmediatamente el enrutamiento (peso canary = 0%) para desviar todo el tráfico fuera del orquestador, volviendo al flujo *legacy* hasta que el incidente sea resuelto.
- **Investigación Post-Mortem**: Utilizar el `traceId` en los logs (Elasticsearch/Splunk) para investigar fallos sin impactar más usuarios.
