# Copilot Instructions for Aurora

This is a Nuxt 4 fullstack Vue application with TypeScript, Tailwind CSS, and comprehensive testing.

## Build, Test, and Lint Commands

**Development:**
```bash
pnpm dev          # Start dev server on http://localhost:3000
pnpm build        # Build for production
pnpm preview      # Preview production build locally
pnpm generate     # Generate static site (if applicable)
```

**Testing:**
```bash
pnpm test                # Run all tests (unit + nuxt + e2e)
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
pnpm test:unit         # Run unit tests only
pnpm test:nuxt         # Run Nuxt component tests only
pnpm test:e2e          # Run E2E tests only
```

**Individual test run example:**
```bash
# Run a specific test file
pnpm test test/unit/example.test.ts

# Run with grep pattern
pnpm test --grep "specific test name"
```

**Linting:**
```bash
pnpm lint          # Lint with ESLint (ESLint is via Nuxt module, run via build/dev)
```

## Project Architecture

**Stack:**
- **Framework**: Nuxt 4 with Vue 3 Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + @nuxt/ui v4 (125+ accessible components)
- **State Management**: Pinia (when needed)
- **Build Tool**: Vite (via Nuxt)
- **Package Manager**: pnpm
- **Testing**: Vitest with three projects (unit, nuxt, e2e)

**Directory Structure:**
```
app/
  app.vue          # Root component (renders NuxtWelcome)

test/
  unit/            # Pure JavaScript unit tests, environment: node
  nuxt/            # Nuxt component tests, environment: happy-dom
  e2e/             # End-to-end tests, environment: node
```

**Key Features & Modules:**
- `@nuxt/a11y` - Accessibility utilities
- `@nuxt/ui` - Pre-built accessible UI components with Tailwind integration
- `@nuxt/eslint` - Nuxt-powered ESLint config (auto-extends .nuxt/eslint.config.mjs)
- `@nuxt/hints` - Development hints for best practices
- `@nuxt/image` - Optimized image handling
- `@nuxt/test-utils` - Testing utilities (auto-configured in vitest.config.ts)
- `@nuxt/scripts` - Script management
- DevTools enabled for development

**TypeScript Configuration:**
- Root tsconfig.json references .nuxt-generated tsconfigs
- Supports app, server, shared, and node environments
- Generated configs in .nuxt/ handle actual types (auto-generated, don't edit)

## Key Conventions

**Testing Patterns:**
- Unit tests: Import from `vitest` directly, use `describe` + `it`
- Nuxt tests: Use `mountSuspended` from `@nuxt/test-utils/runtime` for component testing
- E2E tests: Use Vitest with node environment
- Tests must be in correct directory (unit/, nuxt/, or e2e/) to run in appropriate environment

**Vue/Nuxt Best Practices:**
- Use Composition API with `<script setup>` (via Copilot skill: vue-best-practices)
- Auto-imports enabled: imports from `#app`, composables, components happen automatically
- File-based routing: pages automatically become routes

**Component Development:**
- Use @nuxt/ui components for UI (pre-styled with Tailwind)
- Define props with `defineProps`, events with `defineEmits`, v-model with `defineModel`
- Prefer composables in `composables/` for reusable logic

**Styling:**
- Tailwind CSS v4 utilities - no custom CSS unless necessary
- @nuxt/ui provides unstyled slots for customization
- Color schemes available via @nuxt/ui theming

**Error Handling & DevTools:**
- Nuxt DevTools enabled (`:F12` or `@nuxt/devtools` package)
- App-level error handling via error.vue page

## Available Copilot Skills

The following skills are pre-configured and available:
- `nuxt` - Nuxt 4 framework, SSR, auto-imports, file-based routing
- `nuxt-ui` - @nuxt/ui v4 components, 125+ accessible components, Tailwind theming
- `pinia` - State management (type-safe, extensible)
- `vue` - Vue 3 Composition API, script setup, reactivity
- `vue-best-practices` - Composition API patterns, TypeScript integration
- `vue-router-best-practices` - Navigation guards, route params
- `vue-testing-best-practices` - Vitest, Vue Test Utils, component testing
- `vitetest` - Vitest configuration, mocking, coverage
- `vite` - Vite build configuration and plugins
- `unocss` - Atomic CSS engine (if/when used)
- `vueuse-functions` - VueUse composables for common patterns
- `web-design-guidelines` - UI/UX best practices review

Invoke via `/skill <skill-name>` when relevant to your task.
