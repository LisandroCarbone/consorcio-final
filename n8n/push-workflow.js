const fs = require('fs');
const https = require('https');
const http = require('http');

const env = fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/.env', 'utf8');
const N8N_API_KEY = env.match(/N8N_API_KEY=(.+)/)?.[1]?.trim();
const WORKFLOW_ID = env.match(/N8N_WORKFLOW_ID=(.+)/)?.[1]?.trim();

const payload = JSON.parse(fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/n8n/workflows/actualizar-escalas-suterh.json'));
const body = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: `/api/v1/workflows/${WORKFLOW_ID}`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const parsed = JSON.parse(data);
      console.log('OK — workflow updated:', parsed.id, parsed.name);
      setTimeout(activate, 500);
    } else {
      console.error('ERROR', res.statusCode, data.slice(0, 500));
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(body);
req.end();

function activate() {
  const r = http.request({
    hostname: 'localhost', port: 5678,
    path: `/api/v1/workflows/${WORKFLOW_ID}/activate`,
    method: 'POST',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Length': 0 },
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      if (res.statusCode === 200) console.log('Workflow activated');
      else console.error('Activate error', res.statusCode, d.slice(0, 200));
    });
  });
  r.on('error', e => console.error('Activate request error:', e.message));
  r.end();
}
