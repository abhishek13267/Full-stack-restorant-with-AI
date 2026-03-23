import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ── Load .env file manually (Built-in FS parser) ──────────────────────
const envPath = new URL('.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1').replace(/^\\/, '');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key) process.env[key.trim()] = rest.join('=').trim();
  }
}

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saffron-sage';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_saffron_secret_2026';

// --- Production Security ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', apiLimiter);

// --- MongoDB Schemas ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priceCurrent: { type: String, required: true },
  img: { type: String },
  category: { type: String }
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  payerName: { type: String, required: true },
  amount: { type: String, required: true },
  item: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString() }
});

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Menu = mongoose.model('Menu', MenuSchema);
const Order = mongoose.model('Order', OrderSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const Contact = mongoose.model('Contact', ContactSchema);

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ error: 'Admin only.' });
};

// --- API Endpoints ---

// Menu APIs (mapped _id to id for frontend compatibility)
app.get('/api/menu', async (req, res) => {
  const items = await Menu.find();
  res.json(items.map(item => ({ ...item.toObject(), id: item._id })));
});

app.put('/api/menu/:id', authenticateToken, isAdmin, async (req, res) => {
  await Menu.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

// Feedback
app.get('/api/feedback', authenticateToken, isAdmin, async (req, res) => {
  const list = await Feedback.find().sort({ _id: -1 });
  res.json(list);
});

app.post('/api/feedback', async (req, res) => {
  const f = new Feedback(req.body);
  await f.save();
  res.status(201).json({ success: true });
});

// Contacts
app.get('/api/contacts', authenticateToken, isAdmin, async (req, res) => {
  const list = await Contact.find().sort({ createdAt: -1 });
  res.json(list);
});

app.post('/api/contacts', async (req, res) => {
  const c = new Contact(req.body);
  await c.save();
  res.status(201).json({ success: true });
});

// Users & Auth
app.post('/api/users/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email exists.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  res.status(201).json({ success: true });
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } else {
    res.status(401).json({ error: 'Invalid login.' });
  }
});

// Admin Login (via Env variable)
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.ADMIN_USERNAME || 'abhi123') && password === (process.env.ADMIN_PASSWORD || '12345')) {
    const token = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials.' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const o = new Order(req.body);
  await o.save();
  res.status(201).json({ success: true });
});

app.get('/api/orders', authenticateToken, isAdmin, async (req, res) => {
  const list = await Order.find().sort({ createdAt: -1 });
  res.json(list);
});

// --- MongoDB Initialization ---
mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Saffron & Sage Backend ready on port ${PORT} with MongoDB`));
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));
