#!/usr/bin/env node
// Turns a folder of Unity capture frames (frame_000.png ...) plus still.png into
// <name>.gif, <name>.webp (animated) and <name>-still.webp for the Dev Lab.
//
//   node scripts/make-showcase-anim.mjs <frames-dir> <name> [--width 640] [--fps 20] [--blend 0]
//
// --blend N makes a seamless loop out of motion that never repeats on its own (water, fog):
// the output drops the last N frames and cross-fades them into the first N, so the final
// frame flows straight back into the first.

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const [dir, name] = args;
const option = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 ? Number(args[i + 1]) : fallback;
};
if (!dir || !name) throw new Error('Usage: make-showcase-anim.mjs <frames-dir> <name> [--width 640] [--fps 20] [--blend 0]');

const width = option('--width', 640);
const delay = Math.round(1000 / option('--fps', 20));
const blend = option('--blend', 0);
const outDir = path.resolve('public/images/lab/shaders');
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(dir).filter((f) => /^frame_\d+\.png$/.test(f)).sort();
if (files.length <= blend) throw new Error(`Need more than ${blend} frames in ${dir}`);

const raw = await Promise.all(
    files.map((f) => sharp(path.join(dir, f)).resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true })),
);
const { width: w, height: h } = raw[0].info;

const loopLength = raw.length - blend;
const frames = [];
for (let i = 0; i < loopLength; i++) {
    if (i >= blend) {
        frames.push(raw[i].data);
        continue;
    }
    const head = raw[i].data;
    const tail = raw[loopLength + i].data;
    const t = (i + 1) / (blend + 1);
    const mixed = Buffer.alloc(head.length);
    for (let p = 0; p < head.length; p++) mixed[p] = Math.round(tail[p] + (head[p] - tail[p]) * t);
    frames.push(mixed);
}

const png = await Promise.all(frames.map((data) => sharp(data, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer()));
const anim = () => sharp(png, { join: { animated: true } });
await anim().gif({ delay, loop: 0, colours: 160, effort: 7, dither: 0.5 }).toFile(path.join(outDir, `${name}.gif`));
await anim().webp({ delay, loop: 0, quality: 74, effort: 5 }).toFile(path.join(outDir, `${name}.webp`));

const still = path.join(dir, 'still.png');
if (fs.existsSync(still)) {
    await sharp(still).resize({ width: 1600 }).webp({ quality: 86 }).toFile(path.join(outDir, `${name}-still.webp`));
}

for (const ext of ['.gif', '.webp', '-still.webp']) {
    const file = path.join(outDir, `${name}${ext}`);
    if (fs.existsSync(file)) console.log(`${path.relative(process.cwd(), file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}
