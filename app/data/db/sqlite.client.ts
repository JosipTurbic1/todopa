import { openOrCreate } from '@nativescript-community/sqlite';
import { knownFolders, path } from '@nativescript/core';

type RawDb = {
    execute: (sql: string, params?: any[]) => any;
    select: (sql: string, params?: any[]) => any;
};

export interface Db {
    execSQL(sql: string, params?: any[]): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    get(sql: string, params?: any[]): Promise<any | null>;
}

let dbPromise: Promise<Db> | null = null;

async function toPromise<T>(value: T | Promise<T>): Promise<T> {
    return value instanceof Promise ? value : Promise.resolve(value);
}

function normalizeRows(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.result)) return res.result;
    return [];
}

function callWithOptionalParams(
    ctx: any,
    fn: (sql: string, params?: any[]) => any,
    sql: string,
    params?: any[]
) {
    if (params && params.length > 0) return fn.call(ctx, sql, params);
    return fn.call(ctx, sql);
}


export async function getDb(): Promise<Db> {
    if (!dbPromise) {
        dbPromise = (async () => {
            const documentsPath = knownFolders.documents().path;
            const dbPath = path.join(documentsPath, 'task_manager.db');

            const raw = (await toPromise(openOrCreate(dbPath))) as unknown as RawDb;

            console.log('[SQLITE] dbPath:', dbPath);
            console.log('[SQLITE] methods:', ['execute', 'select'].filter(m => typeof (raw as any)[m] === 'function'));

            if (!raw || typeof raw.execute !== 'function' || typeof raw.select !== 'function') {
                throw new Error('SQLite DB missing execute() and/or select().');
            }

            const adapter: Db = {
                execSQL: async (sql, params) => {
                    return await toPromise(callWithOptionalParams(raw, raw.execute, sql, params));
                },
                all: async (sql, params) => {
                    const res = await toPromise(callWithOptionalParams(raw, raw.select, sql, params));
                    return normalizeRows(res);
                },
                get: async (sql, params) => {
                    const limitedSql = `${sql} LIMIT 1`;
                    const rows = await adapter.all(limitedSql, params);
                    return rows.length ? rows[0] : null;
                },
            };

            return adapter;
        })();
    }

    return dbPromise;
}
