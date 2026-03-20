---
name: code-review
description: Review code for quality, security, and adherence to project conventions
allowed tools: Read, Grep, Glob
---

## Code Review Skill

When reviewing code, check for:

### Quality

- TypeScript strict mode compliance
- Proper error handling (no swallowed errors)
- No unused imports or variables
- Functions under 50 lines, files under 300 lines

### Security

- No API keys or secrets in client code
- All user input sanitized
- SQL injection prevention (use Drizzle ORM parameterized queries)
- XSS prevention in React components
- tenant_id isolation enforced on all queries

### Project Conventions

- File naming: `kebab-case.tsx`
- Components: PascalCase exports
- Hooks: `use-*.ts` pattern
- Features don't import from other features — use `shared/`
- Server-only code stays in `server/`
- DB columns use snake_case

### Mongolian E-Commerce Specific

- Price formatting for MNT (Mongolian Tugrik)
- Mongolian language strings use proper Unicode
- Payment integration (QPay/SocialPay) error handling
