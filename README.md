# Consorcio Platform

Plataforma de automatización para administración de consorcios.
Stack: n8n + PostgreSQL + Redis + MCP servers + Claude agents.

## Arranque rápido

### 1. Variables de entorno

```bash
cp env.example .env
# Editá .env con tus valores reales, especialmente N8N_ENCRYPTION_KEY
```

Generar la clave de encriptación de n8n:
```bash
openssl rand -hex 32
```

### 2. Levantar infraestructura

```bash
docker compose up -d
```

Servicios disponibles:
- **n8n**: http://localhost:5678 (usuario/contraseña del .env)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

El schema de la DB se aplica automáticamente desde `db/migrations/001_init.sql`.

### 3. Instalar y correr el MCP server

```bash
cd mcp-servers/mcp-consorcio
npm install
npm run dev
```

El server corre por stdio — se conecta a Claude Code o a cualquier cliente MCP compatible.

### Agregar a Claude Code (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "consorcio": {
      "command": "node",
      "args": ["C:/ruta/a/consorcio-platform/mcp-servers/mcp-consorcio/dist/index.js"],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_DB": "consorcio",
        "POSTGRES_USER": "consorcio",
        "POSTGRES_PASSWORD": "consorcio_secret"
      }
    }
  }
}
```

## Estructura

```
consorcio-platform/
├── docker-compose.yml          # Infraestructura (n8n + postgres + redis)
├── db/migrations/              # Schema SQL
├── mcp-servers/
│   ├── mcp-consorcio/          # MCP server principal (CRUD de negocio)
│   ├── mcp-pdf/                # Generación de PDFs (Fase 2)
│   └── mcp-whatsapp/           # Integración WhatsApp (Fase 3)
├── agents/                     # Agentes Claude por proceso
├── n8n/workflows/              # Exports de workflows n8n
└── portal/                     # Frontend Next.js (Fase 4+)
```

## Herramientas MCP disponibles (mcp-consorcio)

| Herramienta | Descripción |
|-------------|-------------|
| `list_consorcios` | Lista todos los consorcios |
| `get_consorcio` | Obtiene un consorcio por ID |
| `create_consorcio` | Crea un nuevo consorcio |
| `list_unidades` | Lista unidades de un consorcio con ocupante |
| `get_unidad` | Obtiene una unidad por ID |
| `create_unidad` | Crea una unidad funcional |
| `upsert_persona` | Crea o actualiza un propietario/inquilino |
| `asignar_ocupante` | Asigna persona a unidad |
| `create_periodo` | Abre un período de liquidación |
| `get_periodo` | Obtiene período por consorcio/año/mes |
| `add_gasto` | Agrega un gasto al período |
| `calcular_expensas` | Calcula y genera expensas por coeficiente |
| `marcar_expensa_pagada` | Marca una expensa como pagada |
| `list_expensas_periodo` | Lista expensas con datos del ocupante |
| `create_ticket` | Abre un reclamo/ticket |
| `update_ticket` | Actualiza estado/resolución de ticket |
| `list_tickets` | Lista tickets de un consorcio |
| `add_mensaje_ticket` | Agrega nota a un ticket |
| `list_proveedores` | Lista proveedores activos |
| `create_proveedor` | Registra un proveedor |
| `create_orden_trabajo` | Crea orden de trabajo |
| `update_orden_trabajo` | Actualiza OT (estado, monto, comprobante) |

## Fase 2 — Distribución de Expensas

### Variables de entorno adicionales (agregar al .env)

```env
# SMTP para envío de emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM=tu@gmail.com

# Agente
AGENT_API_KEY=una_clave_secreta
```

### Flujo completo de liquidación

1. Cargar gastos del período via MCP (`add_gasto`)
2. El agente calcula automáticamente la proporción por coeficiente
3. Genera un PDF por unidad con el detalle completo
4. Envía el email con el PDF adjunto a cada propietario con email registrado

### Correr manualmente (CLI)

```bash
cd agents/expensas-agent
npm install
PERIODO_ID=1 DRY_RUN=true npm start    # preview sin enviar emails
PERIODO_ID=1 npm start                 # envío real
```

### Correr como servidor HTTP (para n8n)

```bash
npm run server     # escucha en :3001
# POST /run-expensas { "consorcio_id": 1, "anio": 2026, "mes": 6 }
```

### Importar workflow en n8n

1. Ir a n8n → Workflows → Import
2. Subir `n8n/workflows/distribucion-expensas.json`
3. Configurar la variable de entorno `DEFAULT_CONSORCIO_ID` en n8n
4. Activar el workflow

## Fase 3 — Comunicación WhatsApp

### Variables de entorno adicionales

```env
# WhatsApp provider: "twilio" o "meta"
WA_PROVIDER=twilio

# Twilio (si usás Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Meta Business API (si usás Meta directamente)
META_WA_TOKEN=EAAxxxxxxx
META_WA_PHONE_NUMBER_ID=1234567890
META_WA_VERIFY_TOKEN=consorcio_verify

# Admin (recibe alertas de reclamos urgentes)
ADMIN_WHATSAPP_PHONE=+5491112345678
```

### Flujo de mensajes entrantes

```
Vecino escribe por WhatsApp
        ↓
  Webhook (Twilio o Meta)
        ↓
  Claude clasifica el mensaje
  (reclamo / consulta_expensa / consulta_general / pago / saludo)
        ↓
  ┌─ reclamo ────────────────────────────────────────────────────────┐
  │  • Crea ticket automáticamente en la DB                          │
  │  • Si urgente/alta → notifica al administrador por WhatsApp      │
  └──────────────────────────────────────────────────────────────────┘
        ↓
  Respuesta automática al vecino
```

### Enviar una circular

```bash
curl -X POST http://localhost:3002/send-circular \
  -H "x-api-key: tu_clave" \
  -H "Content-Type: application/json" \
  -d '{ "consorcio_id": 1, "message": "Hola {{nombre}}! Mañana habrá corte de agua de 9 a 13hs." }'
```

O desde n8n importando `n8n/workflows/circular-whatsapp.json`.

### Configurar el webhook en Twilio

En tu consola de Twilio → WhatsApp Sandbox → "When a message comes in":
`https://tu-dominio.com/webhook/twilio`  (POST)

## Fase 4 — Portal Web

El portal corre en `http://localhost:3000` con las siguientes secciones:

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard con stats y tickets urgentes |
| `/consorcios` | CRUD de consorcios, unidades y propietarios |
| `/expensas` | Períodos, carga de gastos, cálculo y seguimiento de pagos |
| `/tickets` | Gestión de reclamos con notas y cambio de estado |
| `/proveedores` | Registro de proveedores y órdenes de trabajo |
| `/circulares` | Envío masivo de avisos por WhatsApp |

### Correr el portal localmente

```bash
cd portal
npm install
npm run dev    # http://localhost:3000
```

### Variables adicionales para el portal

```env
COMMS_AGENT_URL=http://localhost:3002   # para envío de circulares
AGENT_API_KEY=una_clave_secreta
```

## Arquitectura completa

```
┌────────────────────────────────────────────────────────────────────┐
│  Portal Next.js :3000                                              │
│  Dashboard · Consorcios · Expensas · Tickets · Proveedores · Circulares │
└──────────────────┬─────────────────────────────────────────────────┘
                   │ Server Actions (directo a DB)
┌──────────────────▼─────────────────────────────────────────────────┐
│                  PostgreSQL :5432                                   │
└──────┬───────────────────────────────────────────────────────────┬─┘
       │                                                           │
┌──────▼──────┐                                            ┌──────▼──────┐
│  expensas-  │  POST /run-expensas                        │  comms-     │
│  agent :3001│◄── n8n cron workflow                       │  agent :3002│
│             │  Calcula + PDF + email                     │             │
└─────────────┘                                            │  WhatsApp   │
                                                           │  webhook    │
┌──────────────────────────────────────────────────────────┤  + Claude   │
│  n8n :5678                                               │  classifier │
│  - distribucion-expensas.json (cron mensual)             └─────────────┘
│  - circular-whatsapp.json (webhook)                      
└──────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────┐
│  MCP Servers (para Claude Code / agentes externos)                   │
│  mcp-consorcio: 22 herramientas CRUD sobre la DB                    │
│  mcp-pdf: generate_expensa_pdf, generate_expensa_html               │
│  mcp-whatsapp: send_message, send_bulk, send_expensa_notification   │
└──────────────────────────────────────────────────────────────────────┘
```

## Arranque completo con Docker

```bash
cp env.example .env
# Editá .env con tus credenciales reales

docker compose up -d

# Servicios disponibles:
# Portal:     http://localhost:3000
# n8n:        http://localhost:5678
# PostgreSQL: localhost:5432
# Redis:      localhost:6379
# expensas:   http://localhost:3001
# comms:      http://localhost:3002
```

## Roadmap

- [x] Fase 1 — Infraestructura + Schema + MCP server
- [x] Fase 2 — Liquidaciones, generación de PDFs y distribución por email
- [x] Fase 3 — Comunicación con vecinos (WhatsApp, clasificación IA, circulares)
- [x] Fase 4 — Portal web del administrador (Next.js)
- [ ] Próximos pasos: auth del portal, reportes de morosidad, integración CBU/pagos online
