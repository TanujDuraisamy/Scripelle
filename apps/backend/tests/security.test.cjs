const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
for (const name of ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET']) process.env[name] = crypto.randomBytes(32).toString('hex');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused';
for (const name of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GEMINI_API_KEY', 'GEMINI_MODEL']) delete process.env[name];
const { prisma } = require('../dist/db/prisma');
const users = { 1: { id: 1, status: 'approved', tokenVersion: 0, isAdmin: false }, 2: { id: 2, status: 'approved', tokenVersion: 0, isAdmin: true }, 3: { id: 3, status: 'rejected', tokenVersion: 0, isAdmin: false } };
const docs = [{ id: 10, createdBy: 1, title: 'Owner document', content: '', chatHistory: [] }];
let mutationCount = 0;
prisma.user.findUnique = async ({ where }) => users[where.id] || null;
prisma.user.findMany = async ({ select }) => {
  assert.equal(select.password, undefined);
  assert.equal(select.resetToken, undefined);
  return Object.values(users);
};
prisma.documents.findUnique = async ({ where }) => docs.find(d => d.id === where.id && d.createdBy === where.createdBy) || null;
prisma.documents.findMany = async ({ where }) => docs.filter(d => d.createdBy === where.createdBy);
prisma.documents.update = async ({ where, data }) => {
  const d = docs.find(d => d.id === where.id && d.createdBy === where.createdBy);
  assert.ok(d); mutationCount++; return { ...d, ...data };
};
prisma.documents.delete = async () => { mutationCount++; };
const { generateAccessToken, generateRefreshToken } = require('../dist/utils/auth.utils');
const { app } = require('../dist/App');
let server, base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); await prisma.$disconnect(); });
async function request(path, user, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  if (user) headers.Authorization = `Bearer ${generateAccessToken({ userId: user, tokenVersion: 0, email: `user${user}@example.test` })}`;
  return fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
}
test('starts without optional provider credentials', async () => {
  assert.equal((await request('/health')).status, 200);
  assert.equal((await request('/api/v1/auth/google')).status, 503);
});
test('anonymous admin creation is denied', async () => {
  assert.equal((await request('/api/v1/auth/admin/create', null, 'POST', {})).status, 401);
});
test('regular users cannot create administrators', async () => {
  assert.equal((await request('/api/v1/auth/admin/create', 1, 'POST', {})).status, 403);
});
test('anonymous document access and predictions are denied', async () => {
  assert.equal((await request('/api/v1/documents')).status, 401);
  assert.equal((await request('/api/v1/autocompletion/predict', null, 'POST', { text: 'hello' })).status, 401);
});
test('rejected accounts cannot use previously issued access tokens', async () => {
  assert.equal((await request('/api/v1/documents', 3)).status, 403);
});
test('document owner can read and update their document', async () => {
  assert.equal((await request('/api/v1/documents/10', 1)).status, 200);
  assert.equal((await request('/api/v1/documents/10', 1, 'PUT', { title: 'Updated' })).status, 200);
});
test('cross-account reads, updates and deletes are denied without mutation', async () => {
  const initial = mutationCount;
  for (const method of ['GET', 'PUT', 'DELETE']) assert.equal((await request('/api/v1/documents/10', 2, method, method === 'PUT' ? { title: 'Not yours' } : undefined)).status, 404);
  assert.equal(mutationCount, initial);
});
test('document lists are owner scoped and invalid IDs are rejected', async () => {
  assert.deepEqual((await (await request('/api/v1/documents', 2)).json()).data, []);
  assert.equal((await request('/api/v1/documents/10junk', 1)).status, 400);
});
test('admin user listing does not request credential fields', async () => {
  assert.equal((await request('/api/v1/admin/user/list', 2)).status, 200);
});
test('refresh rejects an account that lost approval', async () => {
  const token = generateRefreshToken({ userId: 3, tokenVersion: 0, email: 'user3@example.test' });
  const response = await fetch(base + '/api/v1/auth/refresh', { method: 'POST', headers: { Cookie: `refreshToken=${token}` } });
  assert.equal(response.status, 401);
});
test('missing and identical signing secrets fail closed', () => {
  const env = { ...process.env, JWT_SECRET: '' };
  assert.notEqual(spawnSync(process.execPath, ['-e', 'require("./dist/config/env")'], { env }).status, 0);
  env.JWT_SECRET = env.JWT_REFRESH_SECRET;
  assert.notEqual(spawnSync(process.execPath, ['-e', 'require("./dist/config/env")'], { env }).status, 0);
});
test('password hashing loads without an installation hook', async () => {
  const { hashPassword, comparePassword } = require('../dist/utils/auth.utils');
  const hash = await hashPassword('local-test-password');
  assert.equal(await comparePassword('local-test-password', hash), true);
  assert.equal(await comparePassword('wrong-password', hash), false);
});

test('document validation rejects non-string history entries', async () => {
  assert.equal((await request('/api/v1/documents/10', 1, 'PUT', { chatHistory: [{}] })).status, 400);
});
test('credit reservations reject overspending and refund provider failures', async () => {
  let balance = 1;
  const original = prisma.user.findUnique;
  prisma.user.findUnique = async () => ({ availableCredits: balance });
  prisma.user.updateMany = async ({ where, data }) => {
    if (balance < Number(where.availableCredits.gte)) return { count: 0 };
    balance -= Number(data.availableCredits.decrement); return { count: 1 };
  };
  prisma.user.update = async ({ data }) => { balance += Number(data.availableCredits.increment); return { availableCredits: balance }; };
  const { withCreditTransaction } = require('../dist/utils/credit.utils');
  try {
    const outcomes = await Promise.allSettled([1, 2].map(() => withCreditTransaction(1, 1, async () => 'ok')));
    assert.equal(outcomes.filter(x => x.status === 'fulfilled').length, 1);
    assert.equal(balance, 0);
    balance = 1;
    await assert.rejects(withCreditTransaction(1, 0.1, async () => { throw new Error('provider failed'); }));
    assert.equal(balance, 1);
  } finally { prisma.user.findUnique = original; }
});

test('authenticated AI requests fail clearly when no provider is configured', async () => {
  assert.equal((await request('/api/v1/autocompletion/predict', 1, 'POST', { text: 'hello there' })).status, 503);
});

test('logout revokes existing access and refresh tokens for the account', async () => {
  const original = prisma.user.updateMany;
  const refresh = generateRefreshToken({ userId: 1, email: 'user1@example.test', tokenVersion: 0 });
  prisma.user.updateMany = async ({ where }) => {
    assert.equal(where.tokenVersion, 0);
    users[1].tokenVersion += 1;
    return { count: 1 };
  };
  try {
    const logout = await fetch(base + '/api/v1/auth/logout', { method: 'POST', headers: { Cookie: `refreshToken=${refresh}` } });
    assert.equal(logout.status, 200);
    assert.equal((await request('/api/v1/documents', 1)).status, 403);
    const replay = await fetch(base + '/api/v1/auth/refresh', { method: 'POST', headers: { Cookie: `refreshToken=${refresh}` } });
    assert.equal(replay.status, 401);
  } finally { users[1].tokenVersion = 0; prisma.user.updateMany = original; }
});
test('password reset stores a digest rather than the emailed bearer token', async () => {
  const { EmailService } = require('../dist/services/email.service');
  const { hashResetToken } = require('../dist/utils/auth.utils');
  const find = prisma.user.findUnique, update = prisma.user.update, send = EmailService.sendPasswordResetEmail;
  let saved, delivered;
  prisma.user.findUnique = async () => ({ ...users[1], email: 'user1@example.test' });
  prisma.user.update = async ({ data }) => { saved = data.resetToken; return users[1]; };
  EmailService.sendPasswordResetEmail = async (_email, token) => { delivered = token; };
  try {
    assert.equal((await request('/api/v1/auth/forgot-password', null, 'POST', { email: 'user1@example.test' })).status, 200);
    assert.match(delivered, /^[a-f0-9]{64}$/);
    assert.notEqual(saved, delivered);
    assert.equal(saved, hashResetToken(delivered));
  } finally { prisma.user.findUnique = find; prisma.user.update = update; EmailService.sendPasswordResetEmail = send; }
});
test('reset tokens are single-use and reset invalidates existing access tokens', async () => {
  const { hashResetToken } = require('../dist/utils/auth.utils');
  const token = crypto.randomBytes(32).toString('hex');
  let available = true;
  const original = prisma.user.updateMany;
  prisma.user.updateMany = async ({ where, data }) => {
    assert.equal(where.resetToken, hashResetToken(token));
    assert.ok(where.resetTokenExpiry.gt instanceof Date);
    assert.equal(data.resetToken, null);
    if (!available) return { count: 0 };
    available = false; users[1].tokenVersion += data.tokenVersion.increment;
    return { count: 1 };
  };
  try {
    const reset = () => request('/api/v1/auth/reset-password', null, 'POST', { token, newPassword: 'new-test-password' });
    const responses = await Promise.all([reset(), reset()]);
    assert.deepEqual(responses.map(r => r.status).sort(), [200, 400]);
    assert.equal((await request('/api/v1/documents', 1)).status, 403);
  } finally { users[1].tokenVersion = 0; prisma.user.updateMany = original; }
});
