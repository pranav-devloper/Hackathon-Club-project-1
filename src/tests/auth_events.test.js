import test from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-jwt-secret-key-999';

// Helper: Simulate event tracking and metadata sanitization
function trackEvent(userId, eventType, eventName, pagePath, metadata = {}) {
  const sanitizedMetadata = { ...metadata };
  ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'creditCard'].forEach(k => delete sanitizedMetadata[k]);

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId,
    eventType,
    eventName,
    pagePath: pagePath || '/',
    metadata: sanitizedMetadata,
    createdAt: new Date().toISOString(),
  };
}

test('Password Hashing - securely hashes password with bcrypt and verifies correctly', () => {
  const password = 'SecurePassword123!';
  const hash = bcrypt.hashSync(password, 12);

  assert.notStrictEqual(hash, password);
  assert.strictEqual(bcrypt.compareSync(password, hash), true);
  assert.strictEqual(bcrypt.compareSync('WrongPassword', hash), false);
});

test('User Behavior Tracking - records events with proper structure', () => {
  const event = trackEvent('usr-123', 'page_view', 'view_dashboard', '/dashboard', { tab: 'dashboard' });

  assert.strictEqual(event.userId, 'usr-123');
  assert.strictEqual(event.eventType, 'page_view');
  assert.strictEqual(event.eventName, 'view_dashboard');
  assert.strictEqual(event.pagePath, '/dashboard');
  assert.deepStrictEqual(event.metadata, { tab: 'dashboard' });
  assert.strictEqual(typeof event.createdAt, 'string');
});

test('Behavior Metadata Sanitization - strips sensitive fields (passwords, tokens, secrets)', () => {
  const rawMetadata = {
    action: 'update_profile',
    password: 'SuperSecretPassword!',
    token: 'jwt.token.here',
    secret: 'my-api-secret',
    creditCard: '4111-1111-1111-1111',
    safeField: 'valid_value'
  };

  const event = trackEvent('usr-456', 'click', 'submit_form', '/settings', rawMetadata);

  assert.strictEqual(event.metadata.password, undefined);
  assert.strictEqual(event.metadata.token, undefined);
  assert.strictEqual(event.metadata.secret, undefined);
  assert.strictEqual(event.metadata.creditCard, undefined);
  assert.strictEqual(event.metadata.safeField, 'valid_value');
});

test('Authentication Sessions - generates and verifies valid JWT tokens', () => {
  const userPayload = { id: 'usr-789', email: 'test@manufactory.com', role: 'Production Manager' };
  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

  assert.strictEqual(typeof token, 'string');

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.id, 'usr-789');
  assert.strictEqual(decoded.email, 'test@manufactory.com');
});
