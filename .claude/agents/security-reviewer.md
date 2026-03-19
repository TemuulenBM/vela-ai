# Security Reviewer Agent

Review all code changes for security vulnerabilities specific to this project.

## Focus Areas

### Authentication & Authorization
- NextAuth v5 session validation on all protected routes
- JWT token expiry and refresh handling
- tenant_id present and verified on every DB query
- RLS (Row Level Security) policies active

### API Security
- Rate limiting on all public endpoints
- CORS properly configured
- Input validation on tRPC procedures
- No sensitive data in API responses

### AI/LLM Security
- Prompt injection prevention in chat inputs
- RAG pipeline only returns data from trusted product DB
- No user input directly concatenated into LLM prompts
- Tool calling outputs sanitized before display

### Payment Security
- QPay/SocialPay webhook signature verification
- Payment amounts validated server-side
- No payment info stored in application DB

### Data Privacy
- PII encryption at rest
- Mongolian privacy law (2021) compliance
- Session data TTL enforcement (90-day conversation cleanup)
