---
name: session-bootstrap
description: Run at the start of every session. Checks project health (Docker, git, DB), loads pending plans from engram, and gives a concrete briefing of what's pending and where to continue.
---

# Session Bootstrap

Run this skill at the START of every new session to get oriented fast.

## Steps

### 1. Recover memory context
```
mem_context(project: "consorcio-final")
mem_search(query: "sdd", project: "consorcio-final")
```
Summarize: what plans exist, what phase each is in.

### 2. Check git state
```bash
cd "C:/Users/Ignacio/OneDrive/Escritorio/Proyectaso/consorcio-final"
git status --short
git log --oneline -5
```
Report: uncommitted changes, last 5 commits, current branch.

### 3. Check Docker health
```bash
cd "C:/Users/Ignacio/OneDrive/Escritorio/Proyectaso/consorcio-final"
docker-compose ps 2>/dev/null
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/ 2>/dev/null || echo "Portal DOWN"
```
Report: which containers are running, portal reachable or not.

### 4. Check for DB issues (quick)
```bash
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT 'periodos' AS entity, COUNT(*) FROM app.periodos_expensas
UNION ALL SELECT 'pagos', COUNT(*) FROM app.pagos
UNION ALL SELECT 'unidades', COUNT(*) FROM app.unidades
UNION ALL SELECT 'consorcios', COUNT(*) FROM app.consorcios;
" 2>/dev/null || echo "DB unreachable"
```

### 5. Briefing output

Produce a SHORT briefing (max 10 lines):

```
## Session Briefing
- **Git**: [branch, clean/dirty, last commit summary]
- **Docker**: [up/down, portal status]
- **DB**: [reachable, row counts summary]
- **Pending plans**: [list with phase status]
- **Recommended next action**: [what to work on]
```

## Rules
- This runs ONCE at session start, not repeatedly.
- Total cost: ~3-4K tokens. Very cheap.
- If Docker is down, note it but don't try to fix it — the user decides.
- If engram has no context, say so — it means fresh project or first session.
