import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
const paths = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean))];
let failed = false;
for (const path of paths) {
  if (!existsSync(path)) continue;
  if (/(^|\/)(node_modules|dist)(\/|$)|\.zip$|(^|\/)\.env(?:$|\.(?!example$))|\.(pem|key|pfx)$/.test(path)) {
    console.error(`Forbidden release path: ${path}`); failed = true; continue;
  }
  if (/\.(png|jpe?g|mp4|otf|woff2?|ico)$/i.test(path)) continue;
  const text = readFileSync(path, 'utf8');
  if (/AIza[A-Za-z0-9_-]{35}|sk-(?:proj-)?(?=[A-Za-z0-9_-]*[A-Z0-9])[A-Za-z0-9_-]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(text)) {
    console.error(`Potential credential in ${path}; values omitted`); failed = true;
  }
}
if (failed) process.exitCode = 1;
else console.log('Release file guard passed. This is not a license, history, or full security clearance.');
