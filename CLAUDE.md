# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Run with hot reload (tsx --watch)
npm run build         # Compile TypeScript to dist/

# Database
npm run db:migrate    # Run Prisma migrations (named manger-kanban)
npm run del:migrations  # Reset migrations (destructive: removes all migrations and resets DB)

# After modifying prisma/schema.prisma, regenerate types:
npx prisma generate
```

The app runs on `PORT` from env (default 3000). Swagger UI is at `/docs`.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET_KEY` — Secret for signing JWT tokens
- `PORT` — (optional) server port

## Local Database

```bash
docker-compose up -d  # Starts postgres at localhost:5432
```
DB: `kanban`, user: `postgres`, password: `password`

## Architecture

**Express + TypeScript API** for a Kanban project management app.

### Request Lifecycle

1. `src/index.ts` — bootstraps Express, mounts `/user`, `/project`, and `/board` routers
2. Routes apply middleware in order: `authentication` → `validateZodSchema` → controller
3. Controllers (in `src/controllers/`) parse req/res, call the service, and send the response
4. Services (in `src/services/`) are pure async functions — no Express imports, no req/res

### Key Patterns

**Generated types drive validation**: Prisma schema → `prisma-zod-generator` → `generated/zod/schemas`. Zod schemas are imported from `@generated/zod/schemas` and used in `validateZodSchema()` middleware. Never hand-write validation schemas for models.

**Controller/service split**: Controllers own all HTTP concerns (extract from req, send res, catch errors). Services are pure `async` functions with typed inputs that return typed outputs or throw `AppError`. Never import Express in a service file.

**Error handling**: Services throw `AppError` (from `src/errors/AppError.ts`) for domain/auth errors. All controllers use the same catch shape:
```ts
} catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
    res.status(500).json({ message: "An unhandled error has occurred" });
}
```

**Authentication**: JWT Bearer token middleware (`src/middlewares/authentication.ts`) decodes the token and sets `req.user` (typed via `src/types/express.d.ts` module augmentation). Access the user in controllers via `req.user`.

**Path aliases** (configured in `tsconfig.json`):
- `@/*` → `src/*`
- `@services/*` → `src/services/*`
- `@middlewares/*` → `src/middlewares/*`
- `@generated/*` → `generated/*`

### Data Model (Prisma)

```
User → Project → Board → Column → Task
```
- User owns many Projects; each Project has many Boards; each Board has ordered Columns; each Column has ordered Tasks.
- Prisma client output: `generated/prisma/`; Zod schemas output: `generated/zod/`

### API Docs

Swagger spec lives in `src/swagger/docs/swagger.yaml` (YAML-based, not JSDoc). Loaded at startup via `swagger.ts` and served at `/docs`.
