const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/n8n/workflows/update.json'));

const extractNode = obj.nodes.find(n => n.id === 'node-extract-url');

// Write the code as a proper JSON string — no template literals, no escaping issues
const code = [
  "const html = $input.first().json.data || '';",
  "",
  "let webhookPeriodo = null;",
  "try { webhookPeriodo = $('Webhook Manual').first().json.body?.periodo || null; } catch {}",
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

extractNode.parameters.jsCode = code;

const payload = {
  name: obj.name,
  nodes: obj.nodes,
  connections: obj.connections,
  settings: obj.settings,
  staticData: obj.staticData
};
fs.writeFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/n8n/workflows/update.json', JSON.stringify(payload));
console.log('OK - code length:', code.length);
