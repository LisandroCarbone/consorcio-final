const http = require('http');
const fs = require('fs');
const { randomUUID } = require('crypto');

const env = fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/.env', 'utf8');
const N8N_API_KEY = env.match(/N8N_API_KEY=(.+)/)?.[1]?.trim();
const WORKFLOW_ID = env.match(/N8N_WORKFLOW_ID=(.+)/)?.[1]?.trim();

const wf = JSON.parse(fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/n8n/workflows/live.json'));

// Remove any existing broken webhook node
wf.nodes = wf.nodes.filter(n => n.type !== 'n8n-nodes-base.webhook');
delete wf.connections['Webhook Manual'];

// Add Webhook Manual node with proper UUIDs
const webhookNodeId = randomUUID();
const webhookId = randomUUID();

wf.nodes.push({
  id: webhookNodeId,
  name: 'Webhook Manual',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 2,
  position: [-200, 300],
  parameters: {
    path: 'actualizar-escalas',
    httpMethod: 'POST',
    responseMode: 'lastNode',
  },
  webhookId: webhookId,
});

wf.connections['Webhook Manual'] = {
  main: [[{ node: 'Obtener Índice', type: 'main', index: 0 }]]
};

console.log('Webhook node id:', webhookNodeId);
console.log('webhookId (UUID):', webhookId);

// Update Parsear Escalas node
const parsearNode = wf.nodes.find(n => n.name === 'Parsear Escalas');
parsearNode.parameters.jsCode = [
  "const html = $input.first().json.data || '';",
  "const { periodo, planillaUrl: fuente } = $('Extraer URL del Mes').first().json;",
  "",
  "const extractNumber = (text) => {",
  "  const clean = String(text).replace(/\\./g, '').replace(',', '.');",
  "  const n = parseFloat(clean);",
  "  return isNaN(n) ? 0 : n;",
  "};",
  "",
  "const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim();",
  "",
  "const escalas = [];",
  "const adicionales = [];",
  "",
  "const rows = [...html.matchAll(/<tr[\\s\\S]*?<\\/tr>/gi)];",
  "",
  "for (const rowMatch of rows) {",
  "  const cells = [...rowMatch[0].matchAll(/<t[dh][^>]*>([\\s\\S]*?)<\\/t[dh]>/gi)]",
  "    .map(m => stripTags(m[1]));",
  "",
  "  if (cells.length < 2) continue;",
  "",
  "  const label = cells[0];",
  "  if (!label || /funci.n|concepto|categor.a|header/i.test(label)) continue;",
  "",
  "  const nums = cells.slice(1).map(extractNumber);",
  "  const positiveNums = nums.filter(n => n > 100);",
  "",
  "  if (positiveNums.length >= 4) {",
  "    escalas.push({",
  "      periodo,",
  "      funcion: label,",
  "      cat_1: positiveNums[0],",
  "      cat_2: positiveNums[1],",
  "      cat_3: positiveNums[2],",
  "      cat_4: positiveNums[3],",
  "      fuente_url: fuente",
  "    });",
  "  } else if (nums.length >= 4 && positiveNums.length >= 1) {",
  "    const val = positiveNums[0];",
  "    escalas.push({",
  "      periodo,",
  "      funcion: label,",
  "      cat_1: val,",
  "      cat_2: val,",
  "      cat_3: val,",
  "      cat_4: val,",
  "      fuente_url: fuente",
  "    });",
  "  } else if (positiveNums.length === 1) {",
  "    adicionales.push({",
  "      periodo,",
  "      concepto: label,",
  "      valor: positiveNums[0],",
  "      fuente_url: fuente",
  "    });",
  "  }",
  "}",
  "",
  "if (escalas.length === 0) {",
  "  throw new Error(`No se encontraron escalas en ${fuente}. Verificar estructura HTML.`);",
  "}",
  "",
  "return [{ json: { escalas, adicionales, periodo, fuente, totalEscalas: escalas.length, totalAdicionales: adicionales.length } }];"
].join('\n');

const payload = {
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: wf.settings || {},
  staticData: wf.staticData || null,
};

const body = JSON.stringify(payload);

function put() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost', port: 5678,
      path: `/api/v1/workflows/${WORKFLOW_ID}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(d));
        else reject(new Error(`PUT failed ${res.statusCode}: ${d.slice(0, 300)}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function activate() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost', port: 5678,
      path: `/api/v1/workflows/${WORKFLOW_ID}/activate`,
      method: 'POST',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Length': 0 },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0, 100) }));
    });
    req.on('error', reject);
    req.end();
  });
}

put()
  .then(r => {
    const wh = r.nodes?.find(n => n.name === 'Webhook Manual');
    console.log('PUT OK — webhook node in response:', JSON.stringify(wh?.parameters));
    return new Promise(r => setTimeout(r, 1000));
  })
  .then(() => activate())
  .then(r => console.log('Activate:', r))
  .catch(e => console.error('Error:', e.message));
