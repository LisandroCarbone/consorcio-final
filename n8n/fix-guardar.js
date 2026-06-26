const http = require('http');
const fs = require('fs');
const { randomUUID } = require('crypto');

const env = fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/.env', 'utf8');
const N8N_API_KEY = env.match(/N8N_API_KEY=(.+)/)?.[1]?.trim();
const AGENT_API_KEY = env.match(/AGENT_API_KEY=(.+)/)?.[1]?.trim();
const WORKFLOW_ID = env.match(/N8N_WORKFLOW_ID=(.+)/)?.[1]?.trim();

function getWorkflow() {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost', port: 5678,
      path: `/api/v1/workflows/${WORKFLOW_ID}`,
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

function putWorkflow(payload) {
  const body = JSON.stringify(payload);
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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(d));
        else reject(new Error(`PUT ${res.statusCode}: ${d.slice(0, 300)}`));
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject); req.end();
  });
}

getWorkflow().then(wf => {
  // Fix Guardar en Portal: remove credential-based auth, add x-api-key header directly
  const guardar = wf.nodes.find(n => n.name === 'Guardar en Portal');
  guardar.parameters = {
    method: 'POST',
    url: 'http://portal:3000/api/sueldos/escalas',
    sendHeaders: true,
    headerParameters: {
      parameters: [
        { name: 'x-api-key', value: AGENT_API_KEY },
        { name: 'Content-Type', value: 'application/json' },
      ]
    },
    sendBody: true,
    specifyBody: 'json',
    jsonBody: '={{ JSON.stringify({ escalas: $json.escalas, adicionales: $json.adicionales }) }}',
    options: {},
  };

  // Ensure Webhook Manual has proper UUID (in case it's missing)
  const hasWebhook = wf.nodes.some(n => n.type === 'n8n-nodes-base.webhook');
  if (!hasWebhook) {
    wf.nodes.push({
      id: randomUUID(),
      name: 'Webhook Manual',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [-200, 300],
      parameters: { path: 'actualizar-escalas', httpMethod: 'POST', responseMode: 'lastNode' },
      webhookId: randomUUID(),
    });
    wf.connections['Webhook Manual'] = {
      main: [[{ node: 'Obtener Índice', type: 'main', index: 0 }]]
    };
    console.log('Added Webhook Manual');
  }

  return putWorkflow({
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null,
  });
}).then(r => {
  const g = r.nodes?.find(n => n.name === 'Guardar en Portal');
  console.log('PUT OK — Guardar en Portal headers:', JSON.stringify(g?.parameters?.headerParameters));
  return new Promise(r => setTimeout(r, 500));
}).then(() => activate()).then(code => {
  console.log('Activate:', code);
}).catch(e => console.error('Error:', e.message));
