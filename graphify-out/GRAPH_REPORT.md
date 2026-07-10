# Graph Report - consorcio-final  (2026-07-10)

## Corpus Check
- 142 files · ~153,748 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 824 nodes · 1326 edges · 48 communities (44 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c57304e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- format.ts
- query
- actions.ts
- dependencies
- engine.ts
- server.ts
- package.json
- compilerOptions
- DashboardClient.tsx
- server.ts
- package.json
- package.json
- package.json
- page.tsx
- package.json
- Consorcio Final — Portal de Administración de Consorcios
- index.ts
- index.ts
- restore-webhook.js
- layout.tsx
- page.tsx
- compilerOptions
- compilerOptions
- compilerOptions
- push-workflow.js
- fix-extraer.js
- fix-guardar.js
- page.tsx
- index.ts
- patch-workflow.js
- Reglas de Diseño y Estilo para el Proyecto (Consorcio App)
- patch-parsear.js
- receipt_parser.ts
- next.config.ts
- next-env.d.ts
- tailwind.config.ts
- route.ts
- route.ts

## God Nodes (most connected - your core abstractions)
1. `query()` - 61 edges
2. `queryOne()` - 29 edges
3. `formatMoney()` - 29 edges
4. `formatDate()` - 17 edges
5. `compilerOptions` - 16 edges
6. `runCalculateExpenses()` - 11 edges
7. `cleanPeriodo()` - 11 edges
8. `calcularLiquidacion()` - 11 edges
9. `getEmpleados()` - 10 edges
10. `ConsorcioRequerido()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ParametrosCCTPage()` --calls--> `formatMoney()`  [EXTRACTED]
  portal/src/app/configuracion/parametros-cct/page.tsx → portal/src/lib/format.ts
- `marcarPagada()` --calls--> `query()`  [EXTRACTED]
  portal/src/app/expensas/actions.ts → portal/src/lib/db.ts
- `getLiquidacionDetalle()` --calls--> `queryOne()`  [EXTRACTED]
  portal/src/app/sueldos/actions.ts → portal/src/lib/db.ts
- `classifyMessage()` --references--> `@google/generative-ai`  [EXTRACTED]
  agents/comms-agent/src/classifier.ts → agents/comms-agent/package.json
- `sendCircular()` --calls--> `sendReply()`  [EXTRACTED]
  agents/comms-agent/src/server.ts → agents/comms-agent/src/whatsapp.ts

## Import Cycles
- None detected.

## Communities (48 total, 4 thin omitted)

### Community 0 - "format.ts"
Cohesion: 0.06
Nodes (63): addGasto(), buscarGastosSimilares(), calcularExpensas(), copiarGastos(), createPeriodo(), deleteGasto(), deletePeriodo(), distribuirExpensaIndividual() (+55 more)

### Community 1 - "query"
Cohesion: 0.06
Nodes (56): AdministradorRow, createAdministrador(), deleteAdministrador(), formToAdministrador(), getAdministrador(), getAdministradores(), updateAdministrador(), DeleteAdministradorButton() (+48 more)

### Community 2 - "actions.ts"
Cohesion: 0.06
Nodes (40): calcularLiquidacionesPeriodo(), confirmarLiquidacion(), deleteConceptoAdicionalPeriodo(), EmpleadoForm, EmpleadoRow, getAdicionalRemuneratorio(), getConceptosAdicionalesPeriodo(), getEmpleados() (+32 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (41): autoprefixer, clsx, lucide-react, next, dependencies, clsx, lucide-react, next (+33 more)

### Community 4 - "engine.ts"
Cohesion: 0.11
Nodes (32): POST(), accionLiquidarDespido(), DespidoPage(), TIPOS_EGRESO, accionLiquidarSAC(), SACPage(), Consorcio, ConsorcioRequerido() (+24 more)

### Community 5 - "server.ts"
Cohesion: 0.12
Nodes (28): pool, query(), queryOne(), Consorcio, ExpensaRow, Gasto, MONTH_NAMES, Periodo (+20 more)

### Community 6 - "package.json"
Cohesion: 0.07
Nodes (29): dependencies, nodemailer, pg, puppeteer, zod, description, devDependencies, tsx (+21 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 8 - "DashboardClient.tsx"
Cohesion: 0.07
Nodes (29): react, CircularesTableClient(), CircularesTableClientProps, CircularRow, columns, ConsorcioRow, ConsorciosTableClient(), ConsorciosTableClientProps (+21 more)

### Community 9 - "server.ts"
Cohesion: 0.13
Nodes (18): ClassificationResult, classifyMessage(), genAI, MessageCategory, pool, query(), queryOne(), createTicketFromMessage() (+10 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (25): dependencies, @modelcontextprotocol/sdk, pg, zod, description, devDependencies, tsx, @types/node (+17 more)

### Community 11 - "package.json"
Cohesion: 0.08
Nodes (23): dependencies, @modelcontextprotocol/sdk, puppeteer, zod, description, devDependencies, tsx, @types/node (+15 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): dependencies, @modelcontextprotocol/sdk, twilio, zod, description, devDependencies, tsx, @types/node (+15 more)

### Community 13 - "page.tsx"
Cohesion: 0.12
Nodes (17): capitalize(), EscalasPage(), fmtPeriodo(), getEscalasData(), PeriodoSelect(), TriggerN8nButton(), EmpleadoRow, getEmpleadosActivos() (+9 more)

### Community 14 - "package.json"
Cohesion: 0.08
Nodes (23): dependencies, @google/generative-ai, pg, zod, description, devDependencies, tsx, @types/node (+15 more)

### Community 15 - "Consorcio Final — Portal de Administración de Consorcios"
Cohesion: 0.10
Nodes (20): 1. Clonar el repo, 2. Configurar variables de entorno, 3. Levantar la infraestructura (PostgreSQL + n8n + Redis), 4. Instalar dependencias del portal, 5. Configurar variables del portal para desarrollo local, 6. Correr el portal en desarrollo, 🗄️ Base de datos, 🔧 Configuración n8n (+12 more)

### Community 16 - "index.ts"
Cohesion: 0.22
Nodes (12): pool, query(), queryOne(), allTools, server, transport, consorcioTools, expensaTools (+4 more)

### Community 17 - "index.ts"
Cohesion: 0.20
Nodes (11): PROVIDER, server, transport, getConfig(), post(), sendMessage(), sendTemplate(), FROM() (+3 more)

### Community 18 - "restore-webhook.js"
Cohesion: 0.13
Nodes (12): body, env, fs, http, N8N_API_KEY, parsearNode, payload, { randomUUID } (+4 more)

### Community 19 - "layout.tsx"
Cohesion: 0.16
Nodes (10): metadata, expensasSublinks, generalLinks, Nav(), operationalLinks, sueldosSublinks, Consorcio, MONTHS (+2 more)

### Community 20 - "page.tsx"
Cohesion: 0.27
Nodes (10): distribuirSueldo(), fmt(), fmt0(), fmtPct(), PieChart(), ReciboPage(), PrintButton(), SueldoActionsProps (+2 more)

### Community 21 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, outDir, rootDir, skipLibCheck, strict (+3 more)

### Community 22 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, outDir, rootDir, skipLibCheck, strict (+3 more)

### Community 23 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, module, moduleResolution, outDir, rootDir, skipLibCheck, strict (+3 more)

### Community 24 - "push-workflow.js"
Cohesion: 0.17
Nodes (10): body, env, fs, http, https, N8N_API_KEY, options, payload (+2 more)

### Community 25 - "fix-extraer.js"
Cohesion: 0.18
Nodes (7): AGENT_API_KEY, env, fs, http, N8N_API_KEY, { randomUUID }, WORKFLOW_ID

### Community 26 - "fix-guardar.js"
Cohesion: 0.18
Nodes (7): AGENT_API_KEY, env, fs, http, N8N_API_KEY, { randomUUID }, WORKFLOW_ID

### Community 27 - "page.tsx"
Cohesion: 0.27
Nodes (6): FUNCIONES, EditarEmpleadoPage(), getConsorcios(), getEmpleado(), getConsorcios(), NuevoEmpleadoPage()

### Community 28 - "index.ts"
Cohesion: 0.29
Nodes (8): ensureOutputDir(), htmlToPdf(), server, transport, buildExpensaHtml(), ExpensaData, formatMoney(), MONTH_NAMES

### Community 29 - "patch-workflow.js"
Cohesion: 0.33
Nodes (5): code, extractNode, fs, obj, payload

### Community 30 - "Reglas de Diseño y Estilo para el Proyecto (Consorcio App)"
Cohesion: 0.40
Nodes (4): 1. Diseño y Estructura de Pantallas (Layout), 2. Tablas y Grillas, 3. Sistema de Colores (Diseño Dinámico), Reglas de Diseño y Estilo para el Proyecto (Consorcio App)

### Community 31 - "patch-parsear.js"
Cohesion: 0.40
Nodes (4): data, fs, node, payload

### Community 46 - "route.ts"
Cohesion: 0.24
Nodes (11): CATEGORIAS, esc(), formatDate(), GastoRow, GET(), money(), moneyCompact(), MONTH_NAMES (+3 more)

### Community 47 - "route.ts"
Cohesion: 0.31
Nodes (8): CATEGORIAS, esc(), formatDate(), GastoRow, GET(), money(), MONTH_NAMES, ReceiptRow

## Knowledge Gaps
- **341 isolated node(s):** `name`, `version`, `description`, `type`, `server` (+336 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `query()` connect `query` to `format.ts`, `actions.ts`, `route.ts`, `route.ts`, `layout.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `react` connect `DashboardClient.tsx` to `layout.tsx`, `dependencies`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `DashboardClient.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _342 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `format.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05809802012333658 - nodes in this community are weakly interconnected._
- **Should `query` be split into smaller, more focused modules?**
  _Cohesion score 0.05679974034404414 - nodes in this community are weakly interconnected._
- **Should `actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06168831168831169 - nodes in this community are weakly interconnected._