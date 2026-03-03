#!/usr/bin/env node
/**
 * Asset Optimization Pipeline for Bill's Portfolio
 * Converts: PNG/JPG → WebP, MP4 → WebM, GLB → compressed GLB
 * Run: node scripts/optimize-assets.mjs
 * 
 * Required: npm i -D sharp glob
 * Optional: brew install ffmpeg (for video conversion)
 * Optional: @gltf-transform/* (for GLB compression — already in devDependencies)
 */

import { glob } from 'glob';
import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';

const PUBLIC_DIR = './public';
const MIN_SIZE_KB = 10;
const IGNORE_DIRS = ['models', 'webgl-games']; // Don't optimize game builds or 3D models

// ========== IMAGE OPTIMIZATION ==========
async function optimizeImages() {
    let sharp;
    try { sharp = (await import('sharp')).default; } catch {
        console.log('⚠️  sharp not installed. Skipping image optimization.');
        console.log('   Install: npm i -D sharp');
        return { converted: 0, saved: 0 };
    }

    const ignorePattern = IGNORE_DIRS.map(d => `!${PUBLIC_DIR}/${d}/**`);
    const images = await glob(`${PUBLIC_DIR}/**/*.{png,jpg,jpeg}`, { ignore: ignorePattern });
    
    let converted = 0;
    let totalSaved = 0;

    for (const imgPath of images) {
        const stat = statSync(imgPath);
        if (stat.size < MIN_SIZE_KB * 1024) continue;
        
        const webpPath = imgPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
        if (existsSync(webpPath)) continue; // Already converted

        try {
            const result = await sharp(imgPath).webp({ quality: 80 }).toBuffer();
            writeFileSync(webpPath, result);
            const saved = stat.size - result.length;
            totalSaved += saved;
            converted++;
            console.log(`  ✅ ${basename(imgPath)} → .webp (saved ${(saved / 1024).toFixed(1)}KB)`);
        } catch (err) {
            console.log(`  ❌ ${basename(imgPath)}: ${err.message}`);
        }
    }
    
    return { converted, saved: totalSaved };
}

// ========== VIDEO OPTIMIZATION ==========
async function optimizeVideos() {
    const { execSync } = await import('child_process');
    
    // Check if ffmpeg is available
    try { execSync('ffmpeg -version', { stdio: 'ignore' }); } catch {
        console.log('⚠️  ffmpeg not installed. Skipping video optimization.');
        console.log('   Install: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)');
        return { converted: 0, saved: 0 };
    }

    const ignorePattern = IGNORE_DIRS.map(d => `!${PUBLIC_DIR}/${d}/**`);
    const videos = await glob(`${PUBLIC_DIR}/**/*.mp4`, { ignore: ignorePattern });
    
    let converted = 0;
    let totalSaved = 0;

    for (const vidPath of videos) {
        const webmPath = vidPath.replace(/\.mp4$/i, '.webm');
        if (existsSync(webmPath)) continue;

        try {
            execSync(`ffmpeg -i "${vidPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 96k "${webmPath}" -y`, { stdio: 'ignore' });
            const origSize = statSync(vidPath).size;
            const newSize = statSync(webmPath).size;
            const saved = origSize - newSize;
            totalSaved += saved;
            converted++;
            console.log(`  ✅ ${basename(vidPath)} → .webm (saved ${(saved / 1024).toFixed(1)}KB)`);
        } catch (err) {
            console.log(`  ❌ ${basename(vidPath)}: conversion failed`);
        }
    }

    return { converted, saved: totalSaved };
}

// ========== GLB COMPRESSION ==========
async function compressGLB() {
    let io, document, dedup, quantize, prune;
    try {
        const core = await import('@gltf-transform/core');
        const functions = await import('@gltf-transform/functions');
        io = new core.NodeIO();
        dedup = functions.dedup;
        quantize = functions.quantize;
        prune = functions.prune;
    } catch {
        console.log('⚠️  @gltf-transform not installed. Skipping GLB compression.');
        return { converted: 0, saved: 0 };
    }

    const glbs = await glob(`${PUBLIC_DIR}/models/**/*.glb`);
    let converted = 0;
    let totalSaved = 0;

    for (const glbPath of glbs) {
        const backupPath = glbPath + '.original';
        if (existsSync(backupPath)) continue; // Already compressed

        try {
            const origSize = statSync(glbPath).size;
            const doc = await io.read(glbPath);
            
            await doc.transform(dedup(), quantize(), prune());
            
            // Backup original
            const origData = readFileSync(glbPath);
            writeFileSync(backupPath, origData);
            
            await io.write(glbPath, doc);
            
            const newSize = statSync(glbPath).size;
            const saved = origSize - newSize;
            totalSaved += saved;
            converted++;
            console.log(`  ✅ ${basename(glbPath)} compressed (saved ${(saved / 1024).toFixed(1)}KB)`);
        } catch (err) {
            console.log(`  ❌ ${basename(glbPath)}: ${err.message}`);
        }
    }

    return { converted, saved: totalSaved };
}

// ========== MAIN ==========
async function main() {
    console.log('\n🚀 Asset Optimization Pipeline\n');
    console.log('📸 Optimizing images...');
    const img = await optimizeImages();
    
    console.log('\n🎬 Optimizing videos...');
    const vid = await optimizeVideos();
    
    console.log('\n🎮 Compressing 3D models...');
    const glb = await compressGLB();

    const totalConverted = img.converted + vid.converted + glb.converted;
    const totalSaved = img.saved + vid.saved + glb.saved;
    
    console.log('\n' + '='.repeat(50));
    console.log(`✨ Done! ${totalConverted} files optimized.`);
    console.log(`💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log('='.repeat(50) + '\n');
}

main().catch(console.error);
