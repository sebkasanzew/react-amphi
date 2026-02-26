# Code standards

- Prefer TypeScript strict typing, avoid `any`.
- Functional React components + hooks.
- Keep shared package API stable; avoid breaking changes without migration plan.

## Testing

- Run `bun run test` for e2e (Playwright).
- Add Playwright tests for web changes; unit tests in package where relevant.
- Validate dev: `bun run dev` boots Next.js + pty server.

## Logging & security

- Avoid logging secrets. Don't expose shell access when CLI not running.
