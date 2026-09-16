---
name: test-writer
description: Generate Vitest tests for modified TypeScript files
model: sonnet
tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

# Test Writer Agent

Generate comprehensive Vitest tests for TypeScript files in the consorcio portal.

## Instructions

1. Read the target file(s) to understand their exports and logic
2. Check for existing tests in `portal/src/__tests__/` or co-located `*.test.ts` files
3. Generate tests using Vitest (`describe`, `it`, `expect`)
4. For files that import `@/lib/db`, mock the pool with `vi.mock`
5. For server actions (`"use server"`), test the function logic, not the server action wrapper
6. For engine.ts calculations, test with real SUTERH escala values from known periods
7. Run `cd portal && npx vitest run --reporter=verbose` to verify tests pass

## Test patterns

- Unit tests for pure functions (calculations, formatters, parsers)
- Integration tests for DB queries (mock pg pool)
- Snapshot tests for complex object outputs (liquidation results)

## File naming

- Co-locate tests: `foo.ts` → `foo.test.ts` in the same directory
- Or use `portal/src/__tests__/foo.test.ts`

## Do NOT test

- React components (no jsdom configured)
- Next.js middleware or route handlers
- Third-party library internals
