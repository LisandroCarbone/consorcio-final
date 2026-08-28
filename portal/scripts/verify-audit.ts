// Manual verification script for audit.ts (no test framework in this project).
// Run with: node --experimental-strip-types scripts/verify-audit.ts
// Exercises: secret stripping, insert failure not throwing, and (if DB
// reachable) a full insert + read cycle via logAuditDirect.

import { stripSensitiveKeys, logAuditDirect } from "../src/lib/audit.ts";
import { pool } from "../src/lib/db.ts";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) {
    failures++;
    console.log(`  expected: ${JSON.stringify(expected)}`);
    console.log(`  actual:   ${JSON.stringify(actual)}`);
  }
}

async function main() {
  // 2.1 — stripSensitiveKeys removes password/token/secret/key/credential/clave/encryption
  check(
    "stripSensitiveKeys removes flat secrets",
    stripSensitiveKeys({
      password: "x",
      token: "y",
      secret: "z",
      apiKey: "k",
      credential: "c",
      clave: "cl",
      encryptionKey: "ek",
      name: "keep-me",
    }),
    { name: "keep-me" }
  );

  check(
    "stripSensitiveKeys removes nested secrets",
    stripSensitiveKeys({ after: { name: "y", password: "x" } }),
    { after: { name: "y" } }
  );

  // 2.2 — logAudit / insertAuditRow does not throw when pool.query rejects
  const originalQuery = pool.query.bind(pool);
  // @ts-expect-error — intentionally monkeypatching for this manual check
  pool.query = async () => {
    throw new Error("simulated DB failure");
  };
  try {
    logAuditDirect("tester", "127.0.0.1", "access", "test_entity", "1", { foo: "bar" });
    await new Promise((r) => setTimeout(r, 50));
    console.log("PASS — logAuditDirect does not throw when pool.query rejects");
  } catch (err) {
    failures++;
    console.log("FAIL — logAuditDirect threw:", err);
  }
  // @ts-expect-error — restore
  pool.query = originalQuery;

  // 2.3 — integration: insert then SELECT confirms row
  try {
    const entityId = `verify-${Date.now()}`;
    logAuditDirect("tester", "127.0.0.1", "access", "verify_entity", entityId, {
      note: "integration check",
    });
    await new Promise((r) => setTimeout(r, 200));
    const res = await pool.query(
      "SELECT username, action, entity_type, details, ip_address FROM app.audit_log WHERE entity_id = $1",
      [entityId]
    );
    check("integration insert+select row count", res.rows.length, 1);
    if (res.rows.length === 1) {
      const row = res.rows[0];
      check("integration row username", row.username, "tester");
      check("integration row action", row.action, "access");
      check("integration row entity_type", row.entity_type, "verify_entity");
    }
  } catch (err) {
    console.log("SKIP — integration DB check unavailable:", (err as Error).message);
  }

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().finally(() => pool.end?.());
