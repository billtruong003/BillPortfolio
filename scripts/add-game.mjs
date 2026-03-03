#!/usr/bin/env node
/**
 * Add a Unity WebGL game to the arcade registry
 * 
 * Usage:
 *   node scripts/add-game.mjs <game-id> [--title "Name"] [--genre action] [--desc "..."]
 * 
 * Example:
 *   1. Build Unity WebGL (Gzip compression recommended)
 *   2. Copy Build/ folder to: public/webgl-games/<game-id>/Build/
 *   3. Add thumbnail:        public/webgl-games/<game-id>/thumbnail.webp
 *   4. Run: node scripts/add-game.mjs my-game --title "My Game" --genre action
 */

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const REGISTRY_PATH = './public/webgl-games/registry.json';
const GAMES_DIR = './public/webgl-games';

function parseArgs(args) {
    const result = { _: [] };
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            result[key] = args[i + 1] || true;
            i++;
        } else {
            result._.push(args[i]);
        }
    }
    return result;
}

function detectBuildFiles(gameDir) {
    const buildDir = join(gameDir, 'Build');
    if (!existsSync(buildDir)) return null;

    const files = readdirSync(buildDir);
    const loaderFile = files.find(f => f.endsWith('.loader.js'));
    if (!loaderFile) return null;

    const buildName = loaderFile.replace('.loader.js', '');
    
    // Detect compression
    let compression = 'none';
    if (files.some(f => f.endsWith('.gz'))) compression = 'gzip';
    if (files.some(f => f.endsWith('.br'))) compression = 'brotli';

    // Calculate total build size
    let totalSize = 0;
    for (const file of files) {
        totalSize += statSync(join(buildDir, file)).size;
    }
    const sizeMB = (totalSize / 1024 / 1024).toFixed(0);

    // Check for StreamingAssets
    const hasStreamingAssets = existsSync(join(buildDir, 'StreamingAssets'));

    return { buildName, compression, totalSize: `${sizeMB}MB`, hasStreamingAssets };
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const gameId = args._[0];

    if (!gameId) {
        console.log(`
🎮 Add Game to Arcade Registry

Usage: node scripts/add-game.mjs <game-id> [options]

Options:
  --title     Game title (default: game-id)
  --genre     Genre: action|puzzle|platformer|shooter|rpg|simulation|other
  --desc      Description
  --status    Status: playable|demo|wip|archived (default: demo)
  --version   Product version

Steps:
  1. Build Unity → WebGL (Settings: Gzip compression, Decompression Fallback ON)
  2. Copy Build/ → public/webgl-games/<game-id>/Build/
  3. Add thumbnail → public/webgl-games/<game-id>/thumbnail.webp
  4. Run this script
  5. Edit public/webgl-games/registry.json for details (controls, tags, etc.)
`);
        process.exit(0);
    }

    const gameDir = join(GAMES_DIR, gameId);
    
    if (!existsSync(gameDir)) {
        console.error(`❌ Game directory not found: ${gameDir}`);
        console.log(`   Create it first: mkdir -p public/webgl-games/${gameId}/Build`);
        process.exit(1);
    }

    // Auto-detect build files
    const buildInfo = detectBuildFiles(gameDir);
    if (!buildInfo) {
        console.error(`❌ No Unity build files found in ${gameDir}/Build/`);
        console.log('   Expected files: *.loader.js, *.data.gz, *.framework.js.gz, *.wasm.gz');
        process.exit(1);
    }

    console.log(`\n🔍 Detected build: ${buildInfo.buildName}`);
    console.log(`   Compression: ${buildInfo.compression}`);
    console.log(`   Build size: ${buildInfo.totalSize}`);
    console.log(`   StreamingAssets: ${buildInfo.hasStreamingAssets ? 'Yes' : 'No'}`);

    // Check thumbnail
    const hasThumbnail = existsSync(join(gameDir, 'thumbnail.webp')) || existsSync(join(gameDir, 'thumbnail.png')) || existsSync(join(gameDir, 'thumbnail.jpg'));
    const thumbnailExt = existsSync(join(gameDir, 'thumbnail.webp')) ? '.webp' : existsSync(join(gameDir, 'thumbnail.png')) ? '.png' : '.jpg';
    
    // Load or create registry
    let registry = { games: [], lastUpdated: '' };
    if (existsSync(REGISTRY_PATH)) {
        registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
    }

    // Check if game already exists
    const existingIdx = registry.games.findIndex(g => g.id === gameId);
    
    const newGame = {
        id: gameId,
        title: args.title || gameId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: args.desc || `A ${args.genre || 'other'} game built with Unity WebGL.`,
        thumbnail: hasThumbnail ? `/webgl-games/${gameId}/thumbnail${thumbnailExt}` : '',
        tags: ['Unity', 'WebGL'],
        genre: args.genre || 'other',
        releaseDate: new Date().toISOString().split('T')[0],
        buildSize: buildInfo.totalSize,
        status: args.status || 'demo',
        build: {
            buildPath: `/webgl-games/${gameId}/Build`,
            buildName: buildInfo.buildName,
            compression: buildInfo.compression,
            hasStreamingAssets: buildInfo.hasStreamingAssets,
            companyName: 'BillTheDev',
            productName: args.title || gameId,
            productVersion: args.version || '1.0',
        },
        controls: {
            keyboard: ['WASD / Arrow Keys — Move', 'Space — Jump/Action'],
            mouse: ['Left Click — Interact'],
            touch: false,
        },
        unityVersion: '2022.3 LTS',
    };

    if (existingIdx >= 0) {
        // Update existing — preserve custom fields
        const existing = registry.games[existingIdx];
        registry.games[existingIdx] = {
            ...existing,
            ...newGame,
            // Preserve manually edited fields
            description: existing.description !== `A ${existing.genre} game built with Unity WebGL.` ? existing.description : newGame.description,
            tags: existing.tags.length > 2 ? existing.tags : newGame.tags,
            controls: existing.controls?.keyboard?.length > 2 ? existing.controls : newGame.controls,
        };
        console.log(`\n♻️  Updated existing game: ${gameId}`);
    } else {
        registry.games.push(newGame);
        console.log(`\n✅ Added new game: ${gameId}`);
    }

    registry.lastUpdated = new Date().toISOString();
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 4));

    console.log(`📝 Registry updated: ${REGISTRY_PATH}`);
    console.log(`\n🎮 Game accessible at: /arcade?game=${gameId}`);
    if (!hasThumbnail) {
        console.log(`\n⚠️  No thumbnail found. Add: public/webgl-games/${gameId}/thumbnail.webp`);
    }
    console.log(`\n💡 Edit ${REGISTRY_PATH} to customize controls, description, tags, etc.\n`);
}

main();
