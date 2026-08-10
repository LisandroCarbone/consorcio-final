---
name: db-migration-validator
description: Validate a SQL migration before applying it. Checks FK references, constraint conflicts, data integrity, and rollback safety. Use before running any CREATE TABLE, ALTER TABLE, or data migration.
---

# DB Migration Validator

**Use this skill** before applying any SQL migration to the consorcio database.

## Validation Steps

### 1. Schema Validation
Run these checks against the migration SQL:

```bash
# List all existing tables for FK reference validation
cd "C:/Users/Ignacio/OneDrive/Escritorio/Proyectaso/consorcio-final" && docker exec consorcio-postgres psql -U consorcio -d consorcio -c "\dt app.*"
```

For each `REFERENCES` clause in the migration:
- Verify the target table EXISTS
- Verify the target column EXISTS and has the correct type
- Verify any UNIQUE constraint needed for FK targets exists

For each `NOT NULL` column:
- If adding to an existing table, verify a DEFAULT is provided or the table is empty
- If creating a new table, verify the INSERT flow will always provide a value

### 2. Constraint Conflict Check
```bash
# Check for existing constraints that might conflict
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE connamespace = 'app'::regnamespace
ORDER BY conrelid::regclass::text, contype;
"
```

- Check for duplicate constraint names
- Check for conflicting UNIQUE constraints
- Check for CHECK constraints that might reject valid data

### 3. Data Integrity Pre-check
If the migration modifies existing tables:
```bash
# Count rows that will be affected
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "SELECT COUNT(*) FROM app.<table_name>;"

# Check for NULLs in columns that will become NOT NULL
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "SELECT COUNT(*) FROM app.<table_name> WHERE <column> IS NULL;"
```

### 4. Dry Run
Run the migration in a transaction and ROLLBACK:
```bash
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
BEGIN;
-- paste migration SQL here
-- check results
SELECT COUNT(*) FROM app.<new_or_modified_table>;
ROLLBACK;
"
```

### 5. Rollback Plan
Before applying, document the rollback:
- For CREATE TABLE: `DROP TABLE IF EXISTS app.<table> CASCADE;`
- For ALTER TABLE ADD COLUMN: `ALTER TABLE app.<table> DROP COLUMN <col>;`
- For data migrations: document the reverse UPDATE/DELETE

### 6. Apply
Only after steps 1-5 pass:
```bash
docker exec consorcio-postgres psql -U consorcio -d consorcio -f /path/to/migration.sql
```

### 7. Post-apply Verification
```bash
# Verify table exists and has correct structure
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "\d app.<table>"

# Verify row counts match expectations
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "SELECT COUNT(*) FROM app.<table>;"

# Verify FK integrity
docker exec consorcio-postgres psql -U consorcio -d consorcio -c "
SELECT * FROM app.<table> t
WHERE NOT EXISTS (SELECT 1 FROM app.<referenced_table> r WHERE r.id = t.<fk_column>)
LIMIT 5;
"
```

## Red Flags — STOP and ask user
- Migration drops a column or table
- Migration modifies >1000 rows of production data
- Migration adds NOT NULL without DEFAULT to a populated table
- Migration references a table that doesn't exist yet (ordering issue)
