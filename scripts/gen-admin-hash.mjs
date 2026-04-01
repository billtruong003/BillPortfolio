import crypto from 'crypto';

const password = process.argv[2];

if (!password) {
    process.stdout.write('Error: Password argument is missing.\n');
    process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
process.stdout.write(`${hash}\n`);