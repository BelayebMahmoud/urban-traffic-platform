## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] CI/CD (changes to workflows, Dockerfile, or docker-compose)
- [ ] Documentation update

---

## Description

<!-- What does this PR do? Why is it needed? -->

---

## Services Affected

- [ ] `auth-service`
- [ ] `vehicle-service`
- [ ] `traffic-service`
- [ ] `incident-service`
- [ ] `notification-service`
- [ ] `api-gateway`
- [ ] `libs/common`
- [ ] `libs/prisma-client`
- [ ] Prisma schema (`prisma/schema.prisma`)

---

## Testing Done

- [ ] Unit tests added / updated (`*.service.spec.ts`)
- [ ] All existing tests still pass (`npm test`)
- [ ] Manually tested via GraphQL playground (`http://localhost:3000/graphql`)
- [ ] WebSocket events verified (if applicable)

---

## GraphQL Changes

- [ ] No GraphQL changes
- [ ] New query added
- [ ] New mutation added
- [ ] New subscription / WebSocket event added
- [ ] Schema breaking change (existing query/mutation signature changed)

<!-- If schema changed, paste the relevant GraphQL diff here -->

---

## Database Changes

- [ ] No schema changes
- [ ] New Prisma migration included (`npx prisma migrate dev --name <name>`)
- [ ] Migration is backward-compatible

---

## Checklist

- [ ] `npm test` passes with 0 failures
- [ ] `npm run lint` passes with 0 errors
- [ ] `npx nest build api-gateway` compiles without errors
- [ ] Docker image builds locally (`docker build -f apps/api-gateway/Dockerfile .`)
- [ ] No secrets or `.env` values committed
- [ ] README updated (if behavior visible to users changed)
