import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import twilio from 'twilio';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { initialProducts, initialWorkCenters, initialBOMs, initialMOs, initialUsers } from './src/data/mockData.js';
import authRoutes from './src/routes/auth.routes.js';
import { sendEmail } from './src/services/email.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const DEFAULT_PORT = Number(process.env.PORT || 3000);

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const probe = (port) => {
      const server = net.createServer();
      server.unref();
      server.on('error', () => probe(port + 1));
      server.listen(port, '0.0.0.0', () => {
        const { port: availablePort } = server.address();
        server.close(() => resolve(availablePort));
      });
    };

    probe(startPort);
  });
}

const acountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (acountSid && authToken) ? twilio(acountSid, authToken) : null;


if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production environment variables.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'core-fab-erp-jwt-secret-key-2026';
const OTP_SECRET = process.env.OTP_SECRET || JWT_SECRET || 'core-fab-erp-otp-security-secret-key-2026';

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

let usersDB = initialUsers.map((u) => ({
  ...u,
  passwordHash: defaultPasswordHash,
}));

// In-Memory Database fallback (Synchronizes with PostgreSQL when connected)
let products = [...initialProducts];
let workCenters = [...initialWorkCenters];
let boms = [...initialBOMs];
let manufacturingOrders = [...initialMOs];

// Helper: Get flat array of all work orders across all MOs
function getAllWorkOrders() {
  return manufacturingOrders.flatMap((mo) => mo.workOrders || []);
}

// Secure OTP memory store structure
const otpStore = {};
let simulatedInbox = [];

// Secure User Behavior Events store & helper
const eventsStore = [];
const loginAttempts = {};

function sanitizeMetadata(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeMetadata);
  const sanitized = {};
  const sensitiveKeys = ['password', 'passwordhash', 'token', 'secret', 'apikey', 'creditcard', 'auth', 'authorization'];
  for (const [key, val] of Object.entries(obj)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeMetadata(val);
    }
  }
  return sanitized;
}

function trackEvent(userId, eventType, eventName, pagePath, metadata = {}) {
  const event = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    eventType: eventType || 'general',
    eventName: eventName || 'unknown',
    pagePath: pagePath || '/',
    metadata: sanitizeMetadata(metadata),
    createdAt: new Date().toISOString(),
  };
  eventsStore.push(event);
  return event;
}

// Helper: Cryptographically hash OTP string using SHA-256 HMAC
function hashOtp(otp) {
  return crypto.createHmac('sha256', OTP_SECRET).update(String(otp).trim()).digest('hex');
}

// Helper: Generate CSPRNG 6-digit OTP code using hardware entropy
function generateCsprngOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

// Helper: Sanitize user object (remove passwordHash)
function sanitizeUser(u) {
  const { passwordHash, ...safeUser } = u;
  return safeUser;
}

// Helper: Validate strong password requirements
function validateStrongPassword(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number (0-9).';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*...).';
  }
  return null;
}

// REST API Endpoints

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', postgresqlConfigured: !!process.env.SQL_HOST });
});

// AUTHENTICATION ENDPOINTS (JWT)
app.post('/api/auth/signup', (req, res) => {
  const { email, password, displayName, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const pwdError = validateStrongPassword(password);
  if (pwdError) {
    return res.status(400).json({ error: pwdError });
  }

  const existingUser = usersDB.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const newUser = {
    id: `usr-${Date.now()}`,
    email: email.toLowerCase(),
    displayName: displayName || email.split('@')[0],
    role: role || 'Assembly Operator',
    workerId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    passwordHash,
  };

  usersDB.push(newUser);
  trackEvent(newUser.id, 'auth', 'signup', '/signup', { email: newUser.email });

  const safeUser = sanitizeUser(newUser);
  const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    token,
    user: safeUser,
    message: 'User registered successfully',
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const now = Date.now();
  if (loginAttempts[cleanEmail] && loginAttempts[cleanEmail].lockedUntil > now) {
    const waitSecs = Math.ceil((loginAttempts[cleanEmail].lockedUntil - now) / 1000);
    return res.status(429).json({ error: `Account temporarily locked due to multiple failed login attempts. Try again in ${waitSecs} seconds.` });
  }

  const user = usersDB.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    if (!loginAttempts[cleanEmail]) {
      loginAttempts[cleanEmail] = { count: 1, lockedUntil: 0 };
    } else {
      loginAttempts[cleanEmail].count += 1;
      if (loginAttempts[cleanEmail].count >= 5) {
        loginAttempts[cleanEmail].lockedUntil = now + 15 * 60 * 1000;
        loginAttempts[cleanEmail].count = 0;
      }
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  delete loginAttempts[cleanEmail];
  trackEvent(user.id, 'auth', 'login', '/login', { email: user.email });

  const safeUser = sanitizeUser(user);
  const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    user: safeUser,
    message: 'Login successful',
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = usersDB.find((u) => u.id === decoded.id || u.email.toLowerCase() === decoded.email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

app.get('/api/users', (_req, res) => {
  res.json(usersDB.map(sanitizeUser));
});

// Helper: Send OTP via email using nodemailer if process.env.SMTP_HOST is configured
async function sendOtpEmail(toEmail, otp, displayName) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background-color: #2563eb; color: #ffffff; border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: bold;">M</div>
        <h2 style="color: #0f172a; margin: 16px 0 4px 0; font-size: 22px; font-weight: 800;">Password Reset Verification</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Secure OTP Authentication Service</p>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
        Hello <strong>${displayName || toEmail}</strong>,
      </p>

      <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        We received a request to reset the password for your account. Please use the following 6-digit verification code:
      </p>

      <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #2563eb; font-family: monospace; display: inline-block; text-indent: 10px;">${otp}</span>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
        This code is valid for <strong>5 minutes</strong>. If you did not request a password reset, please ignore this email or contact support.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        &copy; ${new Date().getFullYear()} Manufactory ERP &bull; All Rights Reserved
      </p>
    </div>
  `;

  const result = await sendEmail(
    toEmail,
    'Password Reset Verification Code',
    `Your password reset OTP code is ${otp}. It expires in 5 minutes.`,
    html
  );

  if (result.sent) {
    console.log(`[Email Service] OTP email dispatched to ${toEmail} via ${result.transport}`);
    return {
      sent: true,
      method: 'smtp',
      provider: result.transport,
      message: `OTP verification code sent to ${toEmail}.`,
    };
  }

  return {
    sent: false,
    method: 'smtp_failed',
    message: result.error || 'SMTP or Gmail email configuration is missing.',
  };
}

app.get('/api/auth/inbox', (req, res) => {
  const { email } = req.query;
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    return res.json(simulatedInbox.filter(m => m.to.toLowerCase() === cleanEmail));
  }
  res.json(simulatedInbox);
});

// FORGOT PASSWORD & OTP ENDPOINTS
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Rate Limiting Check: Cooldown of 60 seconds per email
  const existing = otpStore[cleanEmail];
  if (existing && Date.now() - existing.lastSentAt < 60000) {
    const remainingSeconds = Math.ceil((60000 - (Date.now() - existing.lastSentAt)) / 1000);
    return res.status(429).json({
      error: `Security Rate Limit: Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      cooldownSeconds: remainingSeconds,
    });
  }

  const user = usersDB.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'This email address does not exist in our database.' });
  }

  const otp = generateCsprngOtp();
  const hashedOtp = hashOtp(otp);

  otpStore[cleanEmail] = {
    hashedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
    lastSentAt: Date.now(),
  };

  const dispatchResult = await sendOtpEmail(cleanEmail, otp, user.displayName);

  if (!dispatchResult.sent) {
    return res.status(500).json({
      error: `OTP email could not be sent. ${dispatchResult.message}`,
      email: cleanEmail,
      method: dispatchResult.method,
    });
  }

  return res.json({
    message: `Verification code sent to ${cleanEmail}. Please check your email.`,
    email: cleanEmail,
    method: dispatchResult.method,
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const stored = otpStore[cleanEmail];

  if (!stored) {
    return res.status(400).json({ error: 'No active OTP request found for this email. Please request a new code.' });
  }

  if (stored.expiresAt < Date.now()) {
    delete otpStore[cleanEmail];
    return res.status(400).json({ error: 'OTP code has expired (5-minute limit). Please request a new OTP.' });
  }

  stored.attempts += 1;
  if (stored.attempts > 3) {
    delete otpStore[cleanEmail];
    return res.status(429).json({
      error: 'Security Alert: Maximum verification attempts (3) exceeded. OTP invalidated for security.',
    });
  }

  const candidateHash = hashOtp(String(otp).trim());
  const storedHashBuf = Buffer.from(stored.hashedOtp, 'hex');
  const candidateHashBuf = Buffer.from(candidateHash, 'hex');

  const isMatch = storedHashBuf.length === candidateHashBuf.length && crypto.timingSafeEqual(storedHashBuf, candidateHashBuf);

  if (!isMatch) {
    const attemptsRemaining = 3 - stored.attempts;
    return res.status(400).json({
      error: `Invalid OTP code. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before lock out.`,
      attemptsRemaining,
    });
  }

  delete otpStore[cleanEmail];

  const resetToken = jwt.sign(
    { email: cleanEmail, scope: 'password_reset' },
    OTP_SECRET,
    { expiresIn: '5m' }
  );

  return res.json({
    message: 'OTP verified successfully.',
    email: cleanEmail,
    resetToken,
    valid: true,
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, resetToken, otp, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const pwdError = validateStrongPassword(newPassword);
  if (pwdError) {
    return res.status(400).json({ error: pwdError });
  }

  const cleanEmail = email.toLowerCase().trim();

  if (resetToken) {
    try {
      const decoded = jwt.verify(resetToken, OTP_SECRET);
      if (decoded.scope !== 'password_reset' || decoded.email !== cleanEmail) {
        return res.status(400).json({ error: 'Invalid password reset authorization token.' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Reset session expired or token invalid. Please repeat OTP verification.' });
    }
  } else if (otp) {
    const stored = otpStore[cleanEmail];
    if (!stored || stored.expiresAt < Date.now() || hashOtp(otp) !== stored.hashedOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP session. Please restart reset process.' });
    }
    delete otpStore[cleanEmail];
  } else {
    return res.status(400).json({ error: 'Missing password reset authorization token.' });
  }

  const user = usersDB.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);

  return res.json({
    message: 'Password updated securely. You can now log in with your new password.',
  });
});

// Products / Stock Ledger
app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: Date.now(),
    code: req.body.code || `PRD-${Math.floor(100 + Math.random() * 900)}`,
    name: req.body.name || 'New Product',
    category: req.body.category || 'RAW_MATERIAL',
    unitCost: Number(req.body.unitCost) || 0,
    unit: req.body.unit || 'Unit',
    onHand: Number(req.body.onHand) || 0,
    freeToUse: Number(req.body.freeToUse) || Number(req.body.onHand) || 0,
    incoming: Number(req.body.incoming) || 0,
    outgoing: Number(req.body.outgoing) || 0,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Work Centers
app.get('/api/work-centers', (_req, res) => {
  res.json(workCenters);
});

app.post('/api/work-centers', (req, res) => {
  const newWc = {
    id: Date.now(),
    code: req.body.code || `WC-00${workCenters.length + 1}`,
    name: req.body.name || 'New Work Center',
    costPerHour: Number(req.body.costPerHour) || 0,
    capacity: Number(req.body.capacity) || 100,
    status: req.body.status || 'OPERATIONAL',
  };
  workCenters.push(newWc);
  res.status(201).json(newWc);
});

// Bills of Materials (BOM)
app.get('/api/boms', (_req, res) => {
  res.json(boms);
});

app.post('/api/boms', (req, res) => {
  const product = products.find((p) => p.id === Number(req.body.productId));
  const newBom = {
    id: Date.now(),
    code: req.body.code || `BOM-${String(boms.length + 1).padStart(5, '0')}`,
    productId: Number(req.body.productId),
    productName: product ? product.name : 'Finished Product',
    quantity: Number(req.body.quantity) || 1,
    reference: req.body.reference || '',
    components: req.body.components || [],
    operations: req.body.operations || [],
  };
  boms.push(newBom);
  res.status(201).json(newBom);
});

// Manufacturing Orders (MO)
app.get('/api/mo', (_req, res) => {
  res.json(manufacturingOrders);
});

app.post('/api/mo', (req, res) => {
  const moCount = manufacturingOrders.length + 1;
  const moCode = req.body.code || `MO-${String(moCount).padStart(5, '0')}`;
  const finishedProduct = products.find((p) => p.id === Number(req.body.finishedProductId));
  const bom = boms.find((b) => b.id === Number(req.body.bomId));

  const quantity = Number(req.body.quantity) || 1;

  const components = (req.body.components || (bom ? bom.components : [])).map((c, idx) => {
    const componentProd = products.find((p) => p.id === (c.componentProductId || c.productId));
    const requiredQty = (c.quantity || c.toConsume || 1) * quantity;
    const available = componentProd && componentProd.onHand >= requiredQty ? 'Available' : 'Low Stock';
    return {
      id: idx + 1,
      productId: c.componentProductId || c.productId,
      productName: c.componentProductName || (componentProd ? componentProd.name : 'Component'),
      toConsume: requiredQty,
      consumed: 0,
      availability: available,
      unit: c.unit || (componentProd ? componentProd.unit : 'Unit'),
    };
  });

  const workOrders = (req.body.workOrders || (bom ? bom.operations : [])).map((op, idx) => {
    const wc = workCenters.find((w) => w.id === op.workCenterId);
    return {
      id: Date.now() + idx,
      code: `WO-${String(moCount).padStart(5, '0')}-${idx + 1}`,
      moId: Date.now(),
      moCode: moCode,
      operation: op.operationName || op.operation || 'Operation',
      workCenterId: op.workCenterId,
      workCenterName: op.workCenterName || (wc ? wc.name : 'Work Center'),
      finishedProduct: finishedProduct ? finishedProduct.name : 'Finished Good',
      expectedDuration: (op.expectedDuration || 30) * quantity,
      realDuration: 0,
      status: 'To Do',
    };
  });

  const newMO = {
    id: Date.now(),
    code: moCode,
    finishedProductId: Number(req.body.finishedProductId),
    finishedProductName: finishedProduct ? finishedProduct.name : 'Product',
    bomId: req.body.bomId ? Number(req.body.bomId) : null,
    bomCode: bom ? bom.code : undefined,
    quantity: quantity,
    unit: req.body.unit || (finishedProduct ? finishedProduct.unit : 'Unit'),
    scheduleDate: req.body.scheduleDate || new Date().toISOString().split('T')[0],
    assignee: req.body.assignee || 'Unassigned',
    status: 'Draft',
    components: components,
    workOrders: workOrders,
    createdAt: new Date().toISOString(),
  };

  newMO.workOrders.forEach((wo) => {
    wo.moId = newMO.id;
  });

  manufacturingOrders.unshift(newMO);
  res.status(201).json(newMO);
});

// Update MO state (Confirm, Start, Done, Cancel)
app.post('/api/mo/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const newStatus = req.body.status;
  const mo = manufacturingOrders.find((m) => m.id === id);

  if (!mo) {
    return res.status(404).json({ error: 'Manufacturing Order not found' });
  }

  mo.status = newStatus;

  if (newStatus === 'Confirmed') {
    mo.workOrders.forEach((wo) => {
      if (wo.status === 'Cancelled') wo.status = 'To Do';
    });
  } else if (newStatus === 'Done') {
    mo.workOrders.forEach((wo) => {
      wo.status = 'Done';
      if (wo.realDuration === 0) wo.realDuration = wo.expectedDuration;
    });

    mo.components.forEach((comp) => {
      comp.consumed = comp.toConsume;
      const prod = products.find((p) => p.id === comp.productId);
      if (prod) {
        prod.onHand = Math.max(0, prod.onHand - comp.toConsume);
        prod.freeToUse = Math.max(0, prod.freeToUse - comp.toConsume);
      }
    });

    const finishedProd = products.find((p) => p.id === mo.finishedProductId);
    if (finishedProd) {
      finishedProd.onHand += mo.quantity;
      finishedProd.freeToUse += mo.quantity;
    }
  } else if (newStatus === 'Cancelled') {
    mo.workOrders.forEach((wo) => {
      wo.status = 'Cancelled';
    });
  }

  res.json(mo);
});

// Work Orders Endpoints
app.get('/api/work-orders', (_req, res) => {
  res.json(getAllWorkOrders());
});

app.put('/api/work-orders/:id', (req, res) => {
  const id = Number(req.params.id);
  let foundWo = null;

  for (const mo of manufacturingOrders) {
    const woIndex = mo.workOrders.findIndex((w) => w.id === id);
    if (woIndex !== -1) {
      mo.workOrders[woIndex] = { ...mo.workOrders[woIndex], ...req.body };
      foundWo = mo.workOrders[woIndex];

      const allDone = mo.workOrders.every((w) => w.status === 'Done');
      const anyInProgress = mo.workOrders.some((w) => w.status === 'In Progress' || w.status === 'Done');

      if (allDone && mo.status !== 'Done') {
        mo.status = 'Done';
      } else if (anyInProgress && (mo.status === 'Draft' || mo.status === 'Confirmed')) {
        mo.status = 'In-Progress';
      }
      break;
    }
  }

  if (foundWo) {
    res.json(foundWo);
  } else {
    res.status(404).json({ error: 'Work Order not found' });
  }
});

// Overall Stats for Bento Dashboard
app.get('/api/stats', (_req, res) => {
  const allWo = getAllWorkOrders();
  const totalMO = manufacturingOrders.length;
  const inProgressMO = manufacturingOrders.filter((m) => m.status === 'In-Progress' || m.status === 'Confirmed').length;
  const completedMO = manufacturingOrders.filter((m) => m.status === 'Done').length;
  const activeWorkOrders = allWo.filter((w) => w.status === 'In Progress' || w.status === 'To Do').length;

  const totalInventoryValue = products.reduce((acc, p) => acc + p.onHand * p.unitCost, 0);

  res.json({
    totalMO,
    inProgressMO,
    completedMO,
    activeWorkOrders,
    accuracyRate: 99.8,
    totalInventoryValue,
    totalOperationalCosts: 48500,
  });
});

async function startServer() {
  const port = await findAvailablePort(DEFAULT_PORT);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: port + 1,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Manufactory ERP server running on http://0.0.0.0:${port}`);
  });
}

startServer();
