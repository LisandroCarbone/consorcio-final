"use server";

import { pool } from "@/lib/db";
import type { AuditAction } from "@/lib/audit";

export interface AuditLogRow {
  id: number;
  timestamp: Date;
  username: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  consorcio_cuit: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
}

export interface AuditLogFilters {
  entityType?: string;
  consorcioCuit?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  page?: number;
  pageSize?: number;
}

export interface AuditLogPage {
  rows: AuditLogRow[];
  total: number;
  page: number;
  pageSize: number;
}

// Read-only, server-side paginated query. No mutation endpoints exist for
// this table by design — the audit log is append-only.
export async function fetchAuditLogs(filters: AuditLogFilters): Promise<AuditLogPage> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, filters.pageSize ?? 50));
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.entityType) {
    params.push(filters.entityType);
    conditions.push(`entity_type = $${params.length}`);
  }
  if (filters.consorcioCuit) {
    params.push(filters.consorcioCuit);
    conditions.push(`consorcio_cuit = $${params.length}`);
  }
  if (filters.dateFrom) {
    params.push(filters.dateFrom);
    conditions.push(`timestamp >= $${params.length}::date`);
  }
  if (filters.dateTo) {
    params.push(filters.dateTo);
    conditions.push(`timestamp < ($${params.length}::date + interval '1 day')`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM app.audit_log ${whereClause}`,
    params
  );
  const total = Number(countResult.rows[0]?.count ?? 0);

  const dataParams = [...params, pageSize, offset];
  const dataResult = await pool.query<AuditLogRow>(
    `SELECT id, timestamp, username, action, entity_type, entity_id, consorcio_cuit, details, ip_address::text AS ip_address
     FROM app.audit_log
     ${whereClause}
     ORDER BY timestamp DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );

  return { rows: dataResult.rows, total, page, pageSize };
}
