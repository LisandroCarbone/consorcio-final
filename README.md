# Consorcio Final — Portal de Administración de Consorcios

Sistema web completo para la administración de consorcios de propiedad horizontal.

**Stack:** Next.js 14 · PostgreSQL 16 · n8n · Docker

---

## 🚀 Levantar desde cero

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- [Node.js 18+](https://nodejs.org/) (para desarrollo local del portal)
- Git

### 1. Clonar el repo

```bash
git clone https://github.com/LisandroCarbone/consorcio-final.git
cd consorcio-final
```

### 2. Configurar variables de entorno

```bash
cp env.example .env
```

Editá `.env` con tus valores. Como mínimo necesitás cambiar:

```env
# Cambiar estas claves en producción:
POSTGRES_PASSWORD=tu_password_seguro
N8N_PASSWORD=tu_password_n8n
N8N_ENCRYPTION_KEY=  # Generá con: openssl rand -hex 32
```

### 3. Levantar la infraestructura (PostgreSQL + n8n + Redis)

```bash
docker compose up -d postgres redis n8n
```

Esto levanta:
- **PostgreSQL** en `localhost:5432` — el schema se aplica automáticamente desde `db/migrations/001_init.sql`
- **n8n** en `http://localhost:5678` — workflows de automatización
- **Redis** en `localhost:6379` — cola de tareas para n8n

> ⏳ La primera vez tarda ~1 min mientras Docker descarga las imágenes.

Verificar que todo esté OK:
```bash
docker compose ps
```

### 4. Instalar dependencias del portal

```bash
cd portal
npm install
```

### 5. Configurar variables del portal para desarrollo local

Crear `portal/.env.local`:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=consorcio
POSTGRES_USER=consorcio
POSTGRES_PASSWORD=consorcio_secret

N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=                         # Generarlo en n8n: Settings > API > Create API Key
```

### 6. Correr el portal en desarrollo

```bash
cd portal
npm run dev
```

El portal queda disponible en **http://localhost:3000** 🎉

---

## 🏗️ Estructura del proyecto

```
consorcio-final/
├── docker-compose.yml          # Infraestructura completa
├── env.example                 # Template de variables de entorno
├── db/
│   └── migrations/
│       └── 001_init.sql        # Schema completo de la base de datos
├── portal/                     # Aplicación Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/                # Páginas y Server Actions
│   │   │   ├── consorcios/     # ABM de consorcios
│   │   │   ├── sueldos/        # Liquidación de haberes (SUTERH)
│   │   │   │   ├── empleados/  # Empleados por consorcio
│   │   │   │   ├── novedades/  # Horas extras, ausencias, etc.
│   │   │   │   ├── liquidaciones/ # Historial de liquidaciones
│   │   │   │   ├── escalas/    # Escalas salariales SUTERH
│   │   │   │   ├── sac/        # Aguinaldo
│   │   │   │   └── despido/    # Liquidación final
│   │   │   ├── expensas/       # Períodos de expensas y gastos
│   │   │   ├── finanzas/       # Cuenta corriente por unidad
│   │   │   ├── tickets/        # Gestión de reclamos
│   │   │   ├── circulares/     # Comunicaciones
│   │   │   └── proveedores/    # Proveedores y órdenes de trabajo
│   │   ├── lib/
│   │   │   ├── db.ts           # Pool de conexiones PostgreSQL
│   │   │   ├── liquidacion/
│   │   │   │   └── engine.ts   # Motor de cálculo de sueldos (CCT SUTERH)
│   │   │   └── expenses/
│   │   │       └── engine.ts   # Motor de gastos y prorrateo
│   │   └── components/ui/      # Componentes compartidos
│   └── package.json
├── n8n/workflows/              # Exports de workflows n8n (importar manualmente)
└── agents/                     # Agentes de automatización (opcional)
```

---

## 📋 Módulos del portal

### Sueldos y Haberes
- Liquidación mensual según CCT SUTERH con todos los rubros: salario básico, antigüedad, horas extras, feriados, zona desfavorable, caldera, cochera, pileta
- Cálculo automático de aportes y contribuciones (F.931 AFIP): SIJP, Obra Social, ART, SCVO
- Contribuciones sindicales: SUTERH (4.5%), FATERYH (6.5%), SERACARH (0.5%)
- SAC (1° y 2° aguinaldo) con integración de bonificación CCT
- Liquidación final (despido) con indemnización, vacaciones y SAC proporcional
- Exportación en formato AFIP LSD

### Expensas
- Períodos de expensas por consorcio
- **Gastos Categoría 1** (fijos e impositivos): generación automática al confirmar liquidaciones
  - Sueldo neto por empleado
  - F.931, ART, SCVO consolidados (tomados del período anterior)
  - SUTERH, FATERYH, SERACARH consolidados
- **Gastos Categorías 2–10** (variables): carga manual
- Prorrateo por coeficientes A/B con recalculo por período
- Botón **⚡ Regenerar Cat. 1**: re-procesa gastos fijos en cualquier período
- Botón **🔁 Recalcular prorrateo**: solo disponible en el período más reciente

### Cuenta Corriente
- Deuda por unidad
- Saldo anterior, pagos, intereses automáticos por mora

### Otros
- **Tickets**: reclamos de inquilinos/propietarios con seguimiento
- **Circulares**: comunicaciones masivas por consorcio
- **Proveedores**: ABM con órdenes de trabajo vinculadas a tickets

---

## 🔧 Configuración n8n

### Workflow de escalas SUTERH
1. Importar `n8n/workflows/actualizar-escalas.json` en n8n
2. Configurar el trigger para que apunte a `http://localhost:3000/api/sueldos/trigger-escalas`
3. Generar una API Key en n8n: **Settings > n8n API > Create API Key**
4. Agregar la key al `.env` del portal como `N8N_API_KEY`

---

## 🗄️ Base de datos

El schema se inicializa automáticamente al levantar el contenedor de Postgres por primera vez.

Para conectarte manualmente:
```bash
docker exec -it consorcio-postgres psql -U consorcio -d consorcio
```

Todas las tablas están bajo el schema `app`:
```sql
SET search_path TO app, public;
\dt  -- lista todas las tablas
```

---

## 🐳 Modo producción (todo en Docker)

Para correr el portal también en Docker (sin `npm run dev` local):

```bash
docker compose up -d
```

El portal queda disponible en **http://localhost:3010** (mapeado desde el puerto 3000 del contenedor).

> Requiere que exista un `portal/Dockerfile` válido.

---

## 📝 Variables de entorno — referencia completa

| Variable | Descripción | Default |
|---|---|---|
| `POSTGRES_DB` | Nombre de la base de datos | `consorcio` |
| `POSTGRES_USER` | Usuario de Postgres | `consorcio` |
| `POSTGRES_PASSWORD` | Contraseña de Postgres | `consorcio_secret` |
| `POSTGRES_HOST` | Host de Postgres | `localhost` |
| `POSTGRES_PORT` | Puerto de Postgres | `5432` |
| `N8N_USER` | Usuario de n8n | `admin` |
| `N8N_PASSWORD` | Contraseña de n8n | `admin_secret` |
| `N8N_ENCRYPTION_KEY` | Clave de encriptación n8n | ⚠️ Cambiar |
| `N8N_API_KEY` | API Key de n8n para el portal | — |
| `N8N_BASE_URL` | URL base de n8n | `http://localhost:5678` |
| `GEMINI_API_KEY` | API Key de Google Gemini (agentes IA) | — |
| `REDIS_PASSWORD` | Contraseña de Redis | `redis_secret` |
