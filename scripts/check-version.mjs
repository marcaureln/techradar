import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const current = JSON.parse(readFileSync('package.json', 'utf8')).version;

let mainVersion;
try {
  execSync('git fetch origin main --depth=1 --quiet', { stdio: 'ignore' });
  mainVersion = JSON.parse(execSync('git show origin/main:package.json', { encoding: 'utf8' })).version;
} catch {
  process.exit(0);
}

const cmp = (a, b) => {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

if (cmp(current, mainVersion) <= 0) {
  console.error(
    `package.json version (${current}) must be greater than main (${mainVersion}) — bump it before merging to main.`
  );
  process.exit(1);
}
console.log(`version ok: ${current} > ${mainVersion}`);
