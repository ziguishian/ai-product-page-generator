# banana-mall

`banana-mall` is a local-first V1 workspace for AI-assisted e-commerce detail page generation and editing.

It supports:

- connecting any OpenAI-compatible provider with `baseURL + apiKey`
- fetching `/models`, normalizing model capabilities, and recommending default roles
- creating product projects and uploading assets
- running structured AI product analysis from uploaded images
- generating editable, reorderable, retryable section-based detail page plans
- generating images independently for each section
- previewing the full mobile detail page in a phone simulator
- editing and regenerating a single section
- keeping section version history and exporting JSON / images

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Zustand
- react-hook-form + Zod
- Prisma + SQLite
- Local filesystem storage
- OpenAI-compatible AI adapter layer

## Project Structure

```text
auto_mall/
  app/
    api/
    projects/
    settings/
  components/
    analysis/
    editor/
    export/
    layout/
    planner/
    projects/
    providers/
    shared/
    ui/
  hooks/
  lib/
    ai/
      adapters/
      prompts/
      schemas/
    db/
    services/
    storage/
    utils/
    validations/
  prisma/
    migrations/
    schema.prisma
  scripts/
  storage/
    uploads/
    generated/
    exports/
  types/
```

## Main Flow

1. Open `/settings/providers`
2. Enter `Provider name + baseURL + apiKey`
3. Test the connection
4. Discover models and review capability tags
5. Save the current provider and default model roles
6. Open `/projects/new` and create a product project
7. Upload main, angle, detail, and reference images
8. Run product analysis on `/projects/[id]/analysis`
9. Generate and edit section planning on `/projects/[id]/planner`
10. Generate section images and edit single sections on `/projects/[id]/editor`
11. Export project JSON and images on `/projects/[id]/export`

## Provider API Contract

V1 assumes an OpenAI-compatible API surface. A provider is expected to support at least:

- `GET /models`
- `POST /chat/completions`
- `POST /images/generations`

The current implementation is intentionally provider-agnostic and does not hardwire a single vendor.

## Environment Variables

The project already includes a runnable local `.env`. If you want custom values, use `.env.example` as reference.

```env
DATABASE_URL="file:./dev.db"
APP_SECRET="replace-with-your-own-long-secret"
STORAGE_ROOT="./storage"
APP_RUNTIME="web"
# APP_USER_DATA_DIR=""
NEXT_PUBLIC_APP_NAME="banana-mall"
```

Notes:

- `DATABASE_URL` points to the SQLite database
- `APP_SECRET` is used to encrypt stored provider API keys
- `STORAGE_ROOT` is the root folder for uploads, generated assets, and exports
- `APP_RUNTIME` distinguishes `web` and `desktop`
- `APP_USER_DATA_DIR` is primarily injected at runtime by the desktop shell

## Install And Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

After startup, open:

- `http://localhost:3000`
- if `3000` is already occupied, Next.js will automatically switch to the next available port

## Dual Runtime: Web + Desktop

The project now supports both:

- Web mode
- Windows desktop EXE mode

Both runtimes share the same:

- Next.js pages
- Route Handlers APIs
- Prisma schema
- AI provider adapters
- local asset and export services

The difference is only the runtime container and runtime paths:

- Web mode continues to run as a standard Next.js server
- Desktop mode uses `Electron` to boot an internal Next standalone server and render it inside a native desktop window

### Web commands

```bash
npm run dev
npm run build
npm run start
```

### Desktop commands

```bash
npm run build:desktop
npm run desktop:start
npm run dist:win
```

Notes:

- `build:desktop`: builds Next standalone output and prepares the desktop bundle
- `desktop:start`: runs the Electron desktop shell locally
- `dist:win`: creates a Windows installer `exe`

### Desktop data paths

The desktop build does not write project data back into the source workspace. Instead, it stores runtime data under the current Windows user data directory, for example:

- `%APPDATA%/banana-mall/prisma/dev.db`
- `%APPDATA%/banana-mall/storage/uploads`
- `%APPDATA%/banana-mall/storage/generated`
- `%APPDATA%/banana-mall/storage/exports`

At startup, Electron injects:

- `APP_RUNTIME=desktop`
- `DATABASE_URL`
- `STORAGE_ROOT`
- `APP_SECRET`
- `APP_USER_DATA_DIR`

This keeps Web and Desktop builds code-compatible while separating runtime data safely.

## Verified Commands

The following commands were verified in this workspace:

- `npm install`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run build`
- `npm run dev`

Desktop packaging commands become available after installing `electron` and `electron-builder`:

- `npm run build:desktop`
- `npm run desktop:start`
- `npm run dist:win`

## Windows Path Compatibility

The parent directory of this project contains `&`, which can break some npm binary shims on Windows.

To keep the project runnable in this exact location, the repo includes path-safe wrapper scripts:

- `scripts/run-next-safe.cjs`
- `scripts/run-prisma-safe.cjs`
- `scripts/apply-prisma-migrations.cjs`
- `scripts/build-desktop.cjs`

So you can still run:

- `npm run dev`
- `npm run prisma:generate`
- `npm run prisma:migrate`

## Database And Migrations

- Prisma schema: [prisma/schema.prisma](./prisma/schema.prisma)
- Initial migration SQL: [prisma/migrations/20260324000000_init/migration.sql](./prisma/migrations/20260324000000_init/migration.sql)
- The local migration script initializes the database at `prisma/dev.db`

Current core models:

- `Project`
- `ProviderConfig`
- `ModelProfile`
- `ProductAsset`
- `ProductAnalysis`
- `PageSection`
- `SectionVersion`
- `GenerationTask`

## Local Storage Layout

- uploads: `storage/uploads/{projectId}`
- generated images: `storage/generated/{projectId}/{sectionId}`
- exports: `storage/exports/{projectId}`

Image files are stored locally, but the database JSON records remain the system source of truth.

## Pages

- `/`: project dashboard
- `/settings/providers`: provider configuration center
- `/projects/new`: new project
- `/projects/[id]/analysis`: product analysis
- `/projects/[id]/planner`: section planning
- `/projects/[id]/editor`: main editing workspace
- `/projects/[id]/export`: export center

## APIs

- Provider: `/api/providers/*`
- Projects: `/api/projects/*`
- Assets: `/api/assets/*`
- Analysis: `/api/projects/:id/analyze`
- Planner: `/api/projects/:id/plan-sections`
- Generation: `/api/projects/:id/sections/:sectionId/*`
- Export: `/api/projects/:id/export/*`

Unified response shape:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Current V1 Boundaries

- UI and generated content are Chinese-first by default
- product analysis returns structured JSON, not free-form prose
- detail page generation is section-based, not a one-shot black-box page generation
- each section can be generated, failed, and retried independently
- section images support version history and active-version switching
- export supports project JSON and all active section images
- image edit / inpainting is interface-ready but not fully implemented yet
- merged long-image export is intentionally out of V1 scope
- the desktop build currently targets Windows first and does not include auto-update yet

## Future Extensions

- background queue / worker execution
- provider-specific advanced image editing capabilities
- multi-user collaboration and permissions
- merged long-image export
- richer model probing, cost estimation, and call observability
