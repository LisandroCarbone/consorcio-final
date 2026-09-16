---
name: deploy-railway
description: Build, push, deploy to Railway, and verify health check
disable-model-invocation: true
---

# Deploy to Railway

Full deploy pipeline for the consorcio portal.

## Steps

1. **Pre-flight check**: Run `npx tsc --noEmit` in `portal/` to catch type errors before building
2. **Git commit & push**: Stage changes, commit with conventional message, push to `origin/master`
3. **Wait for deploy**: Railway auto-deploys on push. Wait ~90 seconds
4. **Health check**: Hit `https://consorcio-final-production.up.railway.app/api/health` and verify `status: "ok"` and `db: "connected"`
5. **Report**: Show uptime, DB latency, and deploy status

## Failure handling

- If tsc fails: show errors, do NOT push
- If health check fails after 2 minutes: check `railway logs` for errors
- If DB not connected: check Railway Postgres service status

## Notes

- Docker rebuild is NOT needed for Railway deploys (Railway builds from Dockerfile)
- The PostToolUse hook on `git push` also triggers `railway redeploy --yes` as backup
