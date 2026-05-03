## PR Description

- **Título**: "feat(orchestrator): initial scaffold + JWT validation + RBAC"
- **Resumen**: Breve descripción de lo que implementa el PR.

## Cómo probar localmente
1. Copiar `orchestrator/.env.example` a `orchestrator/.env`.
2. Levantar mocks usando `docker-compose -f docker-compose.orchestrator.yml up -d` (si aplica).
3. Ejecutar `npm ci` y `npm test` en el directorio `orchestrator/`.
4. Ejecutar el flujo crítico (E2E) simulado con `curl` o Postman.

## Tests incluidos
- [ ] Unit Tests (validateJwt, rbac, mapper)
- [ ] E2E Testing (Reportado en e2e_report.md)

## Checklist Final
- [ ] Unit tests verdes
- [ ] E2E crítico verde (profesor crea clase)
- [ ] No secrets en commits
- [ ] `.gitignore` incluye `node_modules`, `logs` y `.env`
- [ ] Lint OK
- [ ] Auditoría mínima implementada (audit.log)
- [ ] `rbac_policy.json` cargado y documentado
- [ ] README actualizado

## Notas / Follow-ups
- Implementar endpoint JWKS en MS1.
- Mover secretos a Vault.
- Actualizar MS2 para validar tokens delegados en lugar de llamar síncronamente a MS1.
