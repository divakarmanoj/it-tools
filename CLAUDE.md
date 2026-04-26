# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm** (version pinned in `package.json`).

- `pnpm dev` — Vite dev server with HMR.
- `pnpm build` — Type-check (`vue-tsc --noEmit`) then production build. Requires `NODE_OPTIONS=--max_old_space_size=4096`.
- `pnpm preview` — Serve production build on port 5050 (used by Playwright `webServer`).
- `pnpm test` / `pnpm test:unit` — Vitest in jsdom environment. Single file: `pnpm test:unit path/to/file.test.ts`. Single test: append `-t "test name"`.
- `pnpm test:e2e` — Playwright (chromium, firefox, webkit). Spins up `pnpm preview` automatically.
- `pnpm test:e2e:dev` — Run Playwright against an already-running `pnpm dev` (`http://localhost:5173`), no auto web server.
- `pnpm coverage` — Vitest with coverage.
- `pnpm typecheck` — Standalone type check via `tsconfig.vitest.json`.
- `pnpm lint` — ESLint (`@antfu/eslint-config`) over `src/**`. Auto-fix relies on the editor's `source.fixAll.eslint` action; there is no `lint:fix` script.
- `pnpm script:create:tool <kebab-name>` — Scaffolds a new tool (see Architecture).
- `pnpm script:create:ui` — Hygen generator for a new `c-*` UI component under `src/ui/`.

## Architecture

This is a Vue 3 + Vite single-page app. Each "tool" is a self-contained mini-app registered into a global catalog; the shell handles routing, layout, search, favorites, and i18n.

### Tool registry — the central pattern

- Every tool lives in `src/tools/<kebab-name>/` and exports a `tool` object built with `defineTool(...)` from [src/tools/tool.ts](src/tools/tool.ts). The shape is in [src/tools/tools.types.ts](src/tools/tools.types.ts): `name`, `path`, `description`, `keywords`, `icon`, lazy `component`, optional `redirectFrom`, optional `createdAt` (drives the auto `isNew` badge — true for ~2 weeks after creation).
- Tools are wired into the app by being imported in [src/tools/index.ts](src/tools/index.ts) and placed inside one of the `toolsByCategory` arrays (Crypto, Converter, Web, Images and videos, Development, Network, Math, Measurement, Text, Data). A tool that is imported but not added to a category is **not** routed or shown.
- The router and navigation menus are generated from `toolsByCategory` / `tools`. Do not register routes manually for tools.
- `pnpm script:create:tool my-name` ([scripts/create-tool.mjs](scripts/create-tool.mjs)) creates the directory with `<name>.vue`, `index.ts`, `<name>.service.ts`, `<name>.service.test.ts`, `<name>.e2e.spec.ts`, and inserts the import at the top of `src/tools/index.ts`. You still must add it to a category array. Newer tools follow the convention `<name>.tool.vue` (see [src/tools/token-generator/](src/tools/token-generator/)) — prefer that over the scaffold default.
- Keep tool logic in `*.service.ts` (pure, unit-tested with Vitest). The `.vue` file should be thin: bind inputs, call the service, render results. E2E specs (`*.e2e.spec.ts`) are picked up by Playwright via `testMatch: /\.e2e\.(spec\.)?ts$/` and excluded from Vitest in [vite.config.ts](vite.config.ts).

### Build-time magic to be aware of

Defined in [vite.config.ts](vite.config.ts):

- **`unplugin-auto-import`** — `vue`, `vue-router`, `@vueuse/core`, `vue-i18n`, and naive-ui's `useDialog`/`useMessage`/`useNotification`/`useLoadingBar` are auto-imported. Do not add manual imports for these; auto-generated typings live in `auto-imports.d.ts`.
- **`unplugin-vue-components`** — Every `.vue`/`.md` under `src/` is auto-registered as a global component (typings in `components.d.ts`). Naive UI components and `<icon-*>` from `unplugin-icons` resolve automatically. No manual `import` or `components: {}` registration needed.
- **`@/`** alias resolves to `src/`.
- **`@intlify/unplugin-vue-i18n`** — Loads `locales/*.yml` (global) and is configured with nested keystyle. Per-tool locales can live under `src/tools/*/locales` (i18n-ally setting in README).
- **PWA** via `vite-plugin-pwa` (`generateSW`, `autoUpdate`).
- **Markdown** files are treated as Vue components.

### Shared building blocks

- `src/ui/c-*/` — In-house UI primitives (`c-input-text`, `c-card`, `c-button`, etc.). Prefer these and Naive UI over rolling your own.
- `src/components/` — App-level components (layout, menu, copy buttons, `FormatTransformer`, `TextareaCopyable`, etc.).
- `src/composable/` — Reusable composables: `copy.ts`, `validation.ts`, `queryParams.ts`, `downloadBase64.ts`, `fuzzySearch.ts`, debounced refs, etc.
- `src/stores/`, `src/modules/`, `src/layouts/`, `src/pages/`, `src/plugins/`, `src/themes.ts`, `src/router.ts` — Pinia stores, feature modules (tools menu, favorites, i18n plugin), layouts, top-level pages, theme config, router setup.

### Testing notes

- Vitest runs in `jsdom` and excludes `**/*.e2e.spec.ts`.
- Playwright uses `data-test-id` as the test-id attribute, locale `en-GB`, timezone `Europe/Paris`. CI runs serially with 2 retries.
- `pnpm build` runs `vue-tsc` first; type errors fail the build.
- Some deps ship raw ESM inside a CommonJS package and must be inlined for Vitest. Add to `test.server.deps.inline` in [vite.config.ts](vite.config.ts) (currently `iarna-toml-esm`). Symptom is `SyntaxError: Unexpected token 'export'` from a `node_modules/.../*.js` file during a unit test.
