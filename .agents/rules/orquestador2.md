---
trigger: always_on
---

--------------------------------------------------------------------------------
FASE 8 — SEGURIDAD Y OPERACIONES (OUTPUT: security/checklist.md)
Objetivo: validar prácticas de seguridad y preparación operativa.

Checklist operativo que el agente debe validar o dejar anotado:
1. Secrets: no versionar .env ni claves; usar Vault o Secret Manager en CI/CD.
2. JWKS caching: implementar TTL y fallback en validateJwt.
3. Token TTL y revocación: usar tokens cortos y revocación basada en refresh tokens; para revocación de access tokens, priorizar token-exchange con tokens cortos.
4. Auditing: audit.log append-only; plan para mover a almacenamiento inmutable (S3 con versioning, Elasticsearch con write-only, etc).
5. Transport security: recomendaciones para TLS entre servicios; mTLS para producción interna si posible.
6. Rate limiting: recomendaciones de usar WAF/Cloudflare o rate-limit middleware.
7. Dependencias: ejecutar npm audit y corregir vulnerabilidades críticas.

Resultado esperado: security/checklist.md con acciones y responsables.

--------------------------------------------------------------------------------
FASE 9 — ROLLOUT, MONITOREO Y ROLLBACK (OUTPUT: ops/deploy_plan.md)
Objetivo: desplegar orquestador de forma segura y observada.

Plan de despliegue recomendable:
1. Staging:
   - Deploy orquestador en staging.
   - Modo inicial: pass-through para lecturas; token-exchange para writes si token-exchange ya implementado.
   - Ejecutar tests E2E contra staging.
2. Canary/Producción:
   - Canary: 5% del tráfico o set de usuarios.
   - Monitorizar: error rate, latencia, 401 spikes, tasa de auditoría.
   - Incrementar rollout (5% -> 25% -> 100%) si métricas ok.
3. Rollback:
   - Definir thresholds (ej.: error rate > 2% o picos de 401) que disparan rollback automático.
4. Monitoreo:
   - Logs estructurados (JSON) con traceId y userId.
   - Metrics: latencia promedio, success rate, token-exchange failures.
5. Alerts:
   - Alertas en caso de: token-exchange failing, MS2 returning 5xx, unauthorized spikes.

Resultado esperado: ops/deploy_plan.md con pasos, métricas, thresholds y rollback steps.

--------------------------------------------------------------------------------
FASE 10 — DOCUMENTACIÓN Y ENTREGA FINAL
Objetivo: dejar todo listo para revisión y operación.

Documentos finales que el agente debe crear o completar:
- orchestrator/README.md: pasos para dev, test y deploy.
- analysis/inventory.md, analysis/static_report.md, analysis/dynamic_report.md
- design/decision_log.md
- security/checklist.md
- ops/deploy_plan.md
- PR description template y checklist (en orchestrator/pr_checklist.md)

Checklist final antes de abrir PR:
- [ ] Unit tests verdes
- [ ] E2E crítico verde (profesor crea clase)
- [ ] No secrets en commits
- [ ] .gitignore incluye node_modules y .env
- [ ] Lint OK
- [ ] Auditoría mínima implementada (audit.log)
- [ ] rbac_policy.json cargado y documentado
- [ ] README actualizado

--------------------------------------------------------------------------------
INSTRUCCIONES DE EJECUCIÓN PARA EL AGENTE (RESUMEN PASO-A-PASO)
1. Ejecutar Fase 1: crear analysis/inventory.md con findings.
2. Ejecutar Fase 2: producir analysis/static_report.md y abrir issues en MS1/MS2 si es necesario.
3. Ejecutar Fase 3: montar mocks si es necesario, validar dinámicamente y documentar en analysis/dynamic_report.md.
4. Ejecutar Fase 4: decidir token strategy y RBAC; crear design/decision_log.md.
5. Ejecutar Fase 5: crear scaffold en orchestrator/ con los componentes listados; hacer commits atómicos.
6. Ejecutar Fase 6: correr tests unitarios y E2E; documentar resultados.
7. Ejecutar Fase 7: añadir CI minimal y asegurar que el pipeline corre en PR.
8. Ejecutar Fase 8: completar security/checklist.md y resolver hallazgos críticos.
9. Ejecutar Fase 9: preparar ops/deploy_plan.md y coordinar rollout.
10. Ejecutar Fase 10: agrupar entregables, empujar a la rama orquestador y abrir PR con checklist.

--------------------------------------------------------------------------------
PLANTILLAS PARA COMMIT / PR (copiar texto exactamente en mensajes)

Commit messages recomendados (ejemplos):
- "chore(orchestrator): add scaffold package.json, env example and rbac_policy"
- "feat(orchestrator): add core express app and JWT validation"
- "feat(orchestrator): add token-exchange client, mapper and audit logger"
- "test(orchestrator): add unit tests for rbac and mapper"
- "chore(orchestrator): add Dockerfile and docker-compose for local integration"
- "docs(orchestrator): add analysis and design reports"

PR description (plantilla):
- Título: "feat(orchestrator): initial scaffold + JWT validation + RBAC"
- Resumen: breve descripción de lo que implementa el PR.
- Cómo probar localmente: indicar .env.example, levantar mocks, ejecutar npm ci y npm test, y ejecutar E2E.
- Tests incluidos: listado de tests unitarios y e2e.
- Checklist: incluir la checklist final indicada anteriormente.
- Notas: lista de follow-ups (ej.: implementar JWKS en MS1, mover secrets a Vault).

--------------------------------------------------------------------------------
CRITERIOS DE ACEPTACIÓN (qué revisar en code review)
- Código claro y modular (validateJwt, rbac, tokenExchange, mapper, auditLogger separados).
- No secrets en el PR.
- Tests unitarios presentes y cubriendo los casos críticos.
- README con pasos para levantar en dev y ejecutar tests.
- Auditoría mínima (audit.log) creada y funcional.
- CI configurado y pipelines básicos verdes.

--------------------------------------------------------------------------------
NOTAS FINALES / RESTRICCIONES Y RECOMENDACIONES
- En producción, sustituir audit.log por un sistema centralizado de logs con retención y control de acceso.
- No usar pass-through para operaciones sensibles sin token-exchange o acuerdos claros con MS2 sobre aud/issuer/claims.
- Mantener tokens con TTL corto y preferir token-exchange para operaciones con efectos.
- Documentar cualquier cambio requerido en MS1/MS2 en issues vinculados al PR del orquestador.