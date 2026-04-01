import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const password = process.argv[2];

if (!password) {
    process.stdout.write('Usage: node scripts/setup-env.mjs <your_password>\n');
    process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
const envPath = path.join(process.cwd(), '.env.local');

let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

const hashRegex = /^NEXT_PUBLIC_ADMIN_HASH=.*$/m;
if (hashRegex.test(envContent)) {
    envContent = envContent.replace(hashRegex, `NEXT_PUBLIC_ADMIN_HASH=${hash}`);
} else {
    envContent += `\nNEXT_PUBLIC_ADMIN_HASH=${hash}\n`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n');
process.stdout.write(`SUCCESS: NEXT_PUBLIC_ADMIN_HASH updated in .env.local\n`);