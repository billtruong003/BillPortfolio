#!/usr/bin/env node
// Inspect and clean the R2 bucket that hosts WebGL builds and heavy media.
//
//   node --env-file=.env.local scripts/r2-storage.mjs report
//       Lists every object grouped by folder and marks what the site no longer references.
//   node --env-file=.env.local scripts/r2-storage.mjs prune [--delete]
//       Without --delete it only prints the unreferenced objects. With --delete it removes them.
//       Deletion is permanent (R2 keeps no versions), so read the dry run first.
//   node --env-file=.env.local scripts/r2-storage.mjs stale <local-dir> <r2-prefix> [--delete]
//       After re-uploading a build, lists files under the prefix that the new build no longer has.

import { createHash, createHmac } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_HOST = 'pub-1776f9137d1f4b65986e86fb25ba33ba.r2.dev';
const SCAN_DIRS = ['data', 'content', 'components', 'app', 'lib', 'public/webgl-games'];
const SCAN_EXT = new Set(['.json', '.md', '.ts', '.tsx', '.mjs']);

function required(name) {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name} (fill .env.local)`);
    return value;
}

const sha256 = (v) => createHash('sha256').update(v).digest('hex');
const hmac = (k, v) => createHmac('sha256', k).update(v).digest();
const encodeKey = (key) => key.split('/').map(encodeURIComponent).join('/');

async function s3(method, path, query = '') {
    const accountId = required('R2_ACCOUNT_ID');
    const accessKey = required('R2_ACCESS_KEY_ID');
    const secretKey = required('R2_SECRET_ACCESS_KEY');
    const host = `${accountId}.r2.cloudflarestorage.com`;
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = amzDate.slice(0, 8);
    const payloadHash = sha256('');
    const headers = { host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate };
    const names = Object.keys(headers).sort();
    const canonicalQuery = query.split('&').filter(Boolean).sort().join('&');
    const canonical = [method, path, canonicalQuery, names.map((n) => `${n}:${headers[n]}\n`).join(''), names.join(';'), payloadHash].join('\n');
    const scope = `${date}/auto/s3/aws4_request`;
    const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonical)].join('\n');
    const key = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), 'auto'), 's3'), 'aws4_request');
    const signature = createHmac('sha256', key).update(toSign).digest('hex');
    const res = await fetch(`https://${host}${path}${canonicalQuery ? `?${canonicalQuery}` : ''}`, {
        method,
        headers: { ...headers, authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}` },
    });
    if (!res.ok) throw new Error(`${method} ${path} failed (${res.status}): ${await res.text()}`);
    return res;
}

async function listAll() {
    const bucket = required('R2_BUCKET_NAME');
    const objects = [];
    let token = '';
    do {
        const query = `list-type=2&max-keys=1000${token ? `&continuation-token=${encodeURIComponent(token)}` : ''}`;
        const xml = await (await s3('GET', `/${bucket}`, query)).text();
        for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
            const key = m[1].match(/<Key>([\s\S]*?)<\/Key>/)[1].replace(/&amp;/g, '&');
            const size = Number(m[1].match(/<Size>(\d+)<\/Size>/)[1]);
            objects.push({ key, size });
        }
        token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)?.[1] ?? '' : '';
    } while (token);
    return objects;
}

// Every r2.dev URL the site mentions, reduced to the key or folder it points at.
function referencedPrefixes() {
    const refs = new Set();
    const visit = (dir) => {
        for (const name of readdirSync(dir)) {
            const path = join(dir, name);
            if (statSync(path).isDirectory()) visit(path);
            else if (SCAN_EXT.has(extname(name))) {
                const text = readFileSync(path, 'utf8');
                for (const m of text.matchAll(new RegExp(`https://${PUBLIC_HOST.replace(/\./g, '\\.')}/([^"'\\s)?#]+)`, 'g'))) {
                    refs.add(decodeURIComponent(m[1]).replace(/\/$/, ''));
                }
            }
        }
    };
    SCAN_DIRS.forEach((d) => visit(join(root, d)));
    return [...refs];
}

// A Unity buildPath points at ".../Build"; the sibling StreamingAssets folder belongs to the same game.
const isReferenced = (key, refs) =>
    refs.some((ref) => {
        const base = ref.replace(/\/Build$/, '');
        return key === ref || key.startsWith(`${ref}/`) || (ref.endsWith('/Build') && key.startsWith(`${base}/StreamingAssets/`));
    });

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function main() {
    const [command = 'report'] = process.argv.slice(2);
    const remove = process.argv.includes('--delete');
    const objects = await listAll();
    const refs = referencedPrefixes();
    const unused = objects.filter((o) => !isReferenced(o.key, refs));

    if (command === 'report') {
        const folders = new Map();
        for (const o of objects) {
            const folder = o.key.split('/').slice(0, 2).join('/');
            const entry = folders.get(folder) ?? { size: 0, count: 0, unused: 0 };
            entry.size += o.size;
            entry.count += 1;
            if (!isReferenced(o.key, refs)) entry.unused += o.size;
            folders.set(folder, entry);
        }
        for (const [folder, e] of [...folders].sort((a, b) => b[1].size - a[1].size)) {
            const flag = e.unused === e.size ? 'UNUSED' : e.unused ? `partly unused (${mb(e.unused)})` : '';
            console.log(`${mb(e.size).padStart(10)}  ${String(e.count).padStart(4)} files  ${folder}  ${flag}`);
        }
        console.log(`\nTotal ${mb(objects.reduce((s, o) => s + o.size, 0))} in ${objects.length} objects; unused ${mb(unused.reduce((s, o) => s + o.size, 0))} in ${unused.length} objects.`);
        return;
    }

    if (command === 'prune') {
        const bucket = required('R2_BUCKET_NAME');
        for (const o of unused) {
            if (remove) {
                await s3('DELETE', `/${bucket}/${encodeKey(o.key)}`);
                console.log(`deleted  ${o.key}`);
            } else console.log(`would delete  ${mb(o.size).padStart(9)}  ${o.key}`);
        }
        if (!remove) console.log(`\n${unused.length} objects. Run again with --delete to remove them.`);
        return;
    }

    // Files left under a prefix by an older build that the new upload no longer contains.
    if (command === 'stale') {
        const [, localDir, prefixArg] = process.argv.slice(2);
        if (!localDir || !prefixArg) throw new Error('Usage: stale <local-dir> <r2-prefix> [--delete]');
        const prefix = prefixArg.replace(/^\/+|\/+$/g, '');
        const local = new Set();
        const walk = (dir, rel = '') => {
            for (const name of readdirSync(dir)) {
                const path = join(dir, name);
                const key = rel ? `${rel}/${name}` : name;
                if (statSync(path).isDirectory()) walk(path, key);
                else local.add(`${prefix}/${key}`);
            }
        };
        walk(localDir);
        const bucket = required('R2_BUCKET_NAME');
        const stale = objects.filter((o) => o.key.startsWith(`${prefix}/`) && !local.has(o.key));
        for (const o of stale) {
            if (remove) {
                await s3('DELETE', `/${bucket}/${encodeKey(o.key)}`);
                console.log(`deleted  ${o.key}`);
            } else console.log(`stale  ${mb(o.size).padStart(9)}  ${o.key}`);
        }
        if (!stale.length) console.log(`No stale files under ${prefix}/.`);
        else if (!remove) console.log(`\nRun again with --delete to remove them.`);
        return;
    }

    throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
