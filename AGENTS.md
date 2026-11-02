# CodeCanvas - Project Engineering Rules

## Project Context

CodeCanvas is a collaborative online development workspace
built using Next.js, TypeScript, PostgreSQL, Prisma and Clerk.

Existing functionality:

- Authentication using Clerk
- Team creation and management
- Team invitations
- Team membership
- Monaco-based code editor
- AI assistance using Genkit

Planned functionality:

- Real-time collaborative code editing
- Video conferencing
- Real-time meeting chat
- Project-level role-based access control
- Document persistence and recovery

## Engineering Rules

1. Inspect existing code before modifying anything.
2. Never replace existing working functionality unnecessarily.
3. Follow the existing folder structure and coding conventions.
4. Use TypeScript strictly. Avoid `any`.
5. Use Prisma for database operations.
6. Validate API input using Zod.
7. Authenticate requests using Clerk.
8. Enforce authorization on the server, not only in the UI.
9. Never expose API secrets or service credentials to the browser.
10. Never trust client-supplied user IDs or roles.
11. Use reusable components and hooks.
12. Handle loading, error and disconnected states.
13. Do not introduce duplicate dependencies.
14. Do not modify existing database migrations.
15. Create new Prisma migrations for schema changes.
16. Do not remove existing AI functionality.

## Real-Time Architecture

- Keep video conferencing independent from the code editor.
- Use Yjs for collaborative document synchronization.
- Use Monaco as the editor.
- Use LiveKit for audio/video communication.
- Use a separate real-time channel for meeting chat.
- Do not disconnect the editor when a meeting ends.
- Persist collaborative document state.
- Authenticate and authorize WebSocket connections.
- Validate project permissions before allowing document edits.

## Development Workflow

For every feature:

1. Inspect the existing implementation.
2. Explain the proposed changes.
3. Create an implementation plan.
4. Implement in small stages.
5. Run TypeScript checks.
6. Run ESLint and production build.
7. Test existing functionality for regressions.
8. Report modified files and remaining issues.

Never claim a feature works without verifying it.
