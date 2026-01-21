import { getDb } from './sqlite.client';

const MIGRATION_001 = `
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
)
`;

const MIGRATION_002_TASKS = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NULL,
  status TEXT NOT NULL,
  deadline TEXT NULL,
  priority TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
`;

const MIGRATION_002_TASKS_IDX_1 = `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`;
const MIGRATION_002_TASKS_IDX_2 = `CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline)`;

const MIGRATION_003_SYNC_QUEUE = `
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT NULL,
  created_at TEXT NOT NULL,
  processed_at TEXT NULL
)
`;

const MIGRATION_003_SYNC_QUEUE_IDX = `CREATE INDEX IF NOT EXISTS idx_sync_queue_processed ON sync_queue(processed_at)`;

async function hasMigration(id: number): Promise<boolean> {
    const db = await getDb();
    const rows = await db.all('SELECT id FROM migrations WHERE id = ?', [id]);
    return rows.length > 0;
}

async function markMigration(id: number): Promise<void> {
    const db = await getDb();
    await db.execSQL('INSERT INTO migrations (id, applied_at) VALUES (?, ?)', [
        id,
        new Date().toISOString(),
    ]);
}

async function execStatements(statements: string[], label: string): Promise<void> {
    const db = await getDb();

    for (const raw of statements) {
        const sql = raw.trim();
        if (!sql) continue;

        try {
            console.log(`[MIGRATION:${label}] SQL => ${sql.replace(/\s+/g, ' ').slice(0, 180)}`);
            await db.execSQL(sql);
        } catch (err) {
            console.error(`[MIGRATION:${label}] FAILED SQL => ${sql}`);
            console.error(err);
            throw new Error(`Migration failed at: ${label}\nSQL: ${sql}\nError: ${String(err)}`);
        }
    }
}

export async function runMigrations(): Promise<void> {

    await execStatements([MIGRATION_001], '001_migrations_table');

    if (!(await hasMigration(2))) {
        await execStatements(
            [MIGRATION_002_TASKS, MIGRATION_002_TASKS_IDX_1, MIGRATION_002_TASKS_IDX_2],
            '002_tasks'
        );
        await markMigration(2);
    }

    if (!(await hasMigration(3))) {
        await execStatements([MIGRATION_003_SYNC_QUEUE, MIGRATION_003_SYNC_QUEUE_IDX], '003_sync_queue');
        await markMigration(3);
    }
}
