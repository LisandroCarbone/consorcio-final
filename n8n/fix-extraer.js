const http = require('http');
const fs = require('fs');
const { randomUUID } = require('crypto');

const env = fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/.env', 'utf8');
const N8N_API_KEY = env.match(/N8N_API_KEY=(.+)/)?.[1]?.trim();
const AGENT_API_KEY = env.match(/AGENT_API_KEY=(.+)/)?.[1]?.trim();
const WORKFLOW_ID = env.match(/N8N_WORKFLOW_ID=(.+)/)?.[1]?.trim();

function getWorkflow() {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 5678, path: `/api/v1/workflows/${WORKFLOW_ID}`, headers: { 'X-N8N-API-KEY': N8N_API_KEY } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

function putWorkflow(payload) {
  const body = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 5678, path: `/api/v1/workflows/${WORKFLOW_ID}`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Length': Buffer.byteLength(body) } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => { if (res.statusCode < 300) resolve(JSON.parse(d)); else reject(new Error(`${res.statusCode}: ${d.slice(0,200)}`)); });
    }); req.on('error', reject); req.write(body); req.end();
  });
}

function activate() {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 5678, path: `/api/v1/workflows/${WORKFLOW_ID}/activate`, method: 'POST', headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Length': 0 } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(res.statusCode));
    }); req.on('error', reject); req.end();
  });
}

getWorkflow().then(wf => {
  // Fix Extraer URL del Mes
  const extraer = wf.nodes.find(n => n.name === 'Extraer URL del Mes');
  extraer.parameters.jsCode = [
    "const html = $input.first().json.data || '';",
    "",
    "// If triggered via webhook with a specific period, build URL directly",
    "let webhookPeriodo = null;",
    "try { webhookPeriodo = $('Webhook Manual').first().json.body?.periodo || null; } catch(e) {}",
    "",
    "const MESES_INV = {",
    "  '01':'enero','02':'febrero','03':'marzo','04':'abril','05':'mayo','06':'junio',",
    "  '07':'julio','08':'agosto','09':'septiembre','10':'octubre','11':'noviembre','12':'diciembre'",
    "};",
    "",
    "if (webhookPeriodo) {",
    "  const parts = webhookPeriodo.split('-');",
    "  const anio = parts[0];",
    "  const mes = parts[1].padStart(2, '0');",
    "  const mesNombre = MESES_INV[mes];",
    "  if (!mesNombre) throw new Error('Mes invalido: ' + mes);",
    "  const planillaUrl = 'https://suterh.org.ar/planilla-salarial-' + mesNombre + '-' + anio + '/';",
    "  return [{ json: { planillaUrl, periodo: anio + '-' + mes + '-01' } }];",
    "}",
    "",
    "// Fallback: scrape index for latest period",
    "const MESES = {",
    "  enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06',",
    "  julio:'07', agosto:'08', septiembre:'09', setiembre:'09', octubre:'10',",
    "  noviembre:'11', diciembre:'12'",
    "};",
    "",
    "const re = new RegExp(\"href=[\\\"'](https?://suterh\\\\.org\\\\.ar/planilla-salarial-([a-z]+)-(\\\\d{4})/?)[\\\"']\", 'gi');",
    "const matches = [...html.matchAll(re)];",
    "if (matches.length === 0) throw new Error('No se encontraron links de planillas en el indice SUTERH');",
    "",
    "const parsed = matches",
    "  .map(m => ({ url: m[1].endsWith('/') ? m[1] : m[1] + '/', mesKey: m[2].toLowerCase(), anio: parseInt(m[3], 10) }))",
    "  .filter(p => MESES[p.mesKey])",
    "  .map(p => ({ ...p, monthNum: parseInt(MESES[p.mesKey], 10) }))",
    "  .sort((a, b) => b.anio - a.anio || b.monthNum - a.monthNum);",
    "",
    "if (parsed.length === 0) throw new Error('No se pudo parsear ningun link de planilla');",
    "const best = parsed[0];",
    "const mes = String(best.monthNum).padStart(2, '0');",
    "return [{ json: { planillaUrl: best.url, periodo: best.anio + '-' + mes + '-01' } }];"
  ].join('\n');

  return putWorkflow({
    name: wf.name, nodes: wf.nodes, connections: wf.connections,
    settings: wf.settings || {}, staticData: wf.staticData || null,
  });
}).then(r => {
  const node = r.nodes?.find(n => n.name === 'Extraer URL del Mes');
  console.log('PUT OK — Extraer code includes webhook check:', node?.parameters?.jsCode?.includes('webhookPeriodo'));
  return new Promise(res => setTimeout(res, 500));
}).then(() => activate()).then(code => console.log('Activate:', code))
.catch(e => console.error('Error:', e.message));
