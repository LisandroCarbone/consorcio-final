const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/n8n/workflows/actualizar-escalas-suterh.json'));
const node = data.nodes.find(n => n.name === 'Parsear Escalas');

node.parameters.jsCode = [
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
  "    // Row with 4 cat columns but single value (e.g. Suplente, Personal Jornalizado)",
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
  name: data.name,
  nodes: data.nodes,
  connections: data.connections,
  settings: data.settings,
  staticData: data.staticData
};

fs.writeFileSync(
  'C:/Users/Ignacio/OneDrive/Escritorio/consorcio-final/n8n/workflows/actualizar-escalas-suterh.json',
  JSON.stringify(payload, null, 2)
);

console.log('OK - code length:', node.parameters.jsCode.length);
console.log('Preview:', node.parameters.jsCode.slice(0, 200));
