# Deploy Command

Deploy the application to Vercel.

## Steps
1. Run linter: `npm run lint`
2. Run type check: `npx tsc --noEmit`
3. Run tests: `npm run test`
4. Build: `npm run build`
5. Deploy: `vercel --prod`

## Pre-deploy Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables set in Vercel dashboard
- [ ] Database migrations applied: `npm run db:push`
- [ ] Sentry release created
