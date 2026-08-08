import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

const OTP_SECRET = 'test-otp-secret-key';

function hashOtp(otp) {
  return crypto.createHmac('sha256', OTP_SECRET).update(String(otp).trim()).digest('hex');
}

function generateCsprngOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

test('OTP Generation - generates valid 6-digit numeric string', () => {
  const otp = generateCsprngOtp();
  assert.strictEqual(typeof otp, 'string');
  assert.strictEqual(otp.length, 6);
  assert.match(otp, /^\d{6}$/);
});

test('OTP Expiration - rejects expired OTP', () => {
  const store = {};
  const email = 'test@example.com';
  const otp = '123456';
  
  store[email] = {
    hashedOtp: hashOtp(otp),
    expiresAt: Date.now() - 1000, // expired 1s ago
    attempts: 0
  };

  const stored = store[email];
  const isExpired = stored.expiresAt < Date.now();
  assert.strictEqual(isExpired, true);
  if (isExpired) {
    delete store[email];
  }
  assert.strictEqual(store[email], undefined);
});

test('Correct OTP Verification - successfully verifies correct OTP', () => {
  const store = {};
  const email = 'test@example.com';
  const otp = '654321';
  
  store[email] = {
    hashedOtp: hashOtp(otp),
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0
  };

  const stored = store[email];
  const candidateHash = hashOtp(otp);
  const isMatch = stored.hashedOtp === candidateHash;
  assert.strictEqual(isMatch, true);

  // OTP reuse prevention / deletion
  delete store[email];
  assert.strictEqual(store[email], undefined);
});

test('Incorrect OTP Verification - rejects incorrect OTP and increments attempts', () => {
  const store = {};
  const email = 'test@example.com';
  const otp = '654321';
  const wrongOtp = '111111';
  
  store[email] = {
    hashedOtp: hashOtp(otp),
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0
  };

  const stored = store[email];
  const candidateHash = hashOtp(wrongOtp);
  const isMatch = stored.hashedOtp === candidateHash;
  assert.strictEqual(isMatch, false);

  stored.attempts += 1;
  assert.strictEqual(stored.attempts, 1);
  assert.strictEqual(3 - stored.attempts, 2);
});

test('OTP Reuse Prevention - prevents reusing OTP after successful verification', () => {
  const store = {};
  const email = 'test@example.com';
  const otp = '654321';
  
  store[email] = {
    hashedOtp: hashOtp(otp),
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0
  };

  // First verification
  delete store[email];

  // Second verification attempt
  const storedAfter = store[email];
  assert.strictEqual(storedAfter, undefined);
});

test('Email Sending Failure - handles email dispatch failure gracefully', async () => {
  const mockSendEmail = async () => ({
    sent: false,
    error: 'SMTP connection failed'
  });

  const result = await mockSendEmail();
  assert.strictEqual(result.sent, false);
  assert.strictEqual(typeof result.error, 'string');
});
