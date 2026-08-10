---
name: pre-deploy-checklist
description: Mandatory checklist before declaring any code change as "done". Run this after every edit session before telling the user the work is complete.
---

# Pre-Deploy Checklist

**MANDATORY** — run this checklist before saying "listo", "done", or "terminado" to the user.

## Checklist

### 1. Build Verification
- [ ] Run Docker rebuild: `cd "C:/Users/Ignacio/OneDrive/Escritorio/Proyectaso/consorcio-final" && docker-compose build portal && docker-compose up -d portal`
- [ ] Confirm build completed WITHOUT errors (check for `Compiled successfully`)
- [ ] Confirm container started (`Container consorcio-portal Started`)

### 2. Code Review
- [ ] Re-read every file you edited — look for typos, missing imports, broken syntax
- [ ] Check that no `console.log` or debug code was left in
- [ ] Verify no hardcoded values that should be dynamic
- [ ] Check that DB queries use parameterized values (no SQL injection)

### 3. Data Verification (when DB changes are involved)
- [ ] Run a query to verify the data looks correct after the change
- [ ] Check for NULL constraint violations, FK violations
- [ ] Verify existing data wasn't corrupted

### 4. Verification Honesty
- [ ] If you CANNOT verify the change works (browser pane broken, etc.), say so EXPLICITLY
- [ ] Tell the user: "No pude verificar en el browser. Verificalo en localhost:3005 — específicamente [describe what to check]"
- [ ] NEVER say "funciona" if you didn't actually test it

### 5. Summary
- [ ] Tell the user EXACTLY what changed (files, behavior)
- [ ] Tell the user EXACTLY what to verify and how

## When to Skip
- Documentation-only changes
- Plan/design work (no code changes)
- Git operations (commit, push)
