---
name: testing
description: Jest testing patterns for Next.js with tRPC and Drizzle ORM
allowed tools: Read, Grep, Glob
---

## Testing Patterns

### Structure

- Use `describe` + `it` + AAA pattern (Arrange, Act, Assert)
- Co-locate test files: `feature.test.ts` next to `feature.ts`
- Use factory functions for test data, not raw objects

### Unit Tests

- Test business logic in isolation
- Mock external services (Claude API, QPay, SocialPay)
- Test RAG pipeline stages independently (intent detection, filter extraction, vector search)

### Integration Tests

- Test tRPC routers with real DB (use test database)
- Verify tenant isolation (tenant_id scoping)
- Test auth flows with NextAuth test helpers

### What to Test

- All tRPC procedures
- RAG pipeline: intent detection, embedding generation, search ranking
- Payment webhook handlers
- Analytics event tracking
- Multi-tenant data isolation
