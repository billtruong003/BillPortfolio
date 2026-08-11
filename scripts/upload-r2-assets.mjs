#!/usr/bin/env node

import { createHash, createHmac } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { basename, relative, resolve, sep } from 'node:path';

function required(name) {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
}

function hmac(key, value) {
    return createHmac('sha256', key).update(value).digest();
}

function encodePath(value) {
    return value.split('/').map(encodeURIComponent).join('/');
}

async function hashFile(path) {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    return hash.digest('hex');
}

async function md5File(path) {
    const hash = createHash('md5');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    return hash.digest('hex');
}

async function collectFiles(root) {
    const files = [];
    async function visit(dir) {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
            const path = resolve(dir, entry.name);
            if (entry.isDirectory()) await visit(path);
            else if (entry.isFile() && entry.name !== '.gitkeep') files.push(path);
        }
    }
    await visit(root);
    return files;
}

function metadata(path) {
    const name = basename(path).toLowerCase();
    const immutable = name.endsWith('.unityweb') || name.endsWith('.bundle');
    let contentType = 'application/octet-stream';
    if (name.endsWith('.js')) contentType = 'text/javascript; charset=utf-8';
    else if (name.endsWith('.json')) contentType = 'application/json; charset=utf-8';
    else if (name.endsWith('.xml')) contentType = 'application/xml; charset=utf-8';
    else if (name.endsWith('.hash')) contentType = 'text/plain; charset=utf-8';
    else if (name.endsWith('.bin')) contentType = 'application/octet-stream';
    else if (name.endsWith('.mp4')) contentType = 'video/mp4';
    else if (name.endsWith('.webm')) contentType = 'video/webm';
    else if (name.endsWith('.png')) contentType = 'image/png';
    else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (name.endsWith('.gif')) contentType = 'image/gif';
    else if (name.endsWith('.webp')) contentType = 'image/webp';
    else if (name.endsWith('.svg')) contentType = 'image/svg+xml';
    return {
        contentType,
        cacheControl: immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, must-revalidate',
    };
}

async function signedRequest({ method, key, bodyPath, contentLength, payloadHash, contentType, cacheControl }) {
    const accountId = required('R2_ACCOUNT_ID');
    const accessKey = required('R2_ACCESS_KEY_ID');
    const secretKey = required('R2_SECRET_ACCESS_KEY');
    const bucket = required('R2_BUCKET_NAME');
    const endpoint = `${accountId}.r2.cloudflarestorage.com`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = amzDate.slice(0, 8);
    const canonicalUri = `/${encodePath(bucket)}/${encodePath(key)}`;
    const headers = {
        host: endpoint,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
    };
    if (contentType) headers['content-type'] = contentType;
    if (cacheControl) headers['cache-control'] = cacheControl;
    const signedHeaderNames = Object.keys(headers).sort();
    const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${headers[name]}\n`).join('');
    const signedHeaders = signedHeaderNames.join(';');
    const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
    const scope = `${date}/auto/s3/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
    const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), 'auto'), 's3'), 'aws4_request');
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const requestHeaders = {
        ...headers,
        authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    };
    if (contentLength !== undefined) requestHeaders['content-length'] = String(contentLength);
    const response = await fetch(`https://${endpoint}${canonicalUri}`, {
        method,
        headers: requestHeaders,
        body: bodyPath ? createReadStream(bodyPath) : undefined,
        duplex: bodyPath ? 'half' : undefined,
    });
    if (!response.ok) throw new Error(`${method} ${key} failed (${response.status}): ${await response.text()}`);
    return response;
}

async function main() {
    const sourceArg = process.argv[2];
    const prefixArg = process.argv[3];
    if (!sourceArg || !prefixArg) {
        throw new Error('Usage: node scripts/upload-r2-assets.mjs <source-directory> <r2-prefix>');
    }
    const source = resolve(sourceArg);
    const prefix = prefixArg.replace(/^\/+|\/+$/g, '');
    const files = await collectFiles(source);
    let uploaded = 0;
    for (const path of files) {
        const info = await stat(path);
        const relativePath = relative(source, path).split(sep).join('/');
        const key = `${prefix}/${relativePath}`;
        const payloadHash = await hashFile(path);
        const payloadMd5 = await md5File(path);
        const { contentType, cacheControl } = metadata(path);
        process.stdout.write(`Uploading ${key} (${(info.size / 1024 / 1024).toFixed(2)} MiB)... `);
        await signedRequest({ method: 'PUT', key, bodyPath: path, contentLength: info.size, payloadHash, contentType, cacheControl });
        const head = await signedRequest({ method: 'HEAD', key, payloadHash: createHash('sha256').update('').digest('hex') });
        const sizeHeader = head.headers.get('content-length');
        const remoteSize = sizeHeader === null ? null : Number(sizeHeader);
        const remoteEtag = head.headers.get('etag')?.replace(/^W\//i, '').replaceAll('"', '').toLowerCase();
        if (remoteSize !== null && remoteSize !== info.size) throw new Error(`Size mismatch for ${key}: local=${info.size}, remote=${remoteSize}`);
        if (remoteEtag && remoteEtag !== payloadMd5) throw new Error(`ETag mismatch for ${key}: local=${payloadMd5}, remote=${remoteEtag}`);
        uploaded += info.size;
        console.log('verified');
    }
    console.log(`Uploaded ${files.length} files, ${(uploaded / 1024 / 1024).toFixed(2)} MiB total.`);
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
