import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Persistent Local Database Setup ---
const DATA_FILE = './users.json';
let users = [];

async function loadDB() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    users = JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with an empty array
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}
loadDB();

async function saveDB() {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

// --- Authentication Routes ---
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, history: [] });
  await saveDB(); // Save to file
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AI Agent Route ---
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 4096,
  apiKey: process.env.GOOGLE_API_KEY,
});

app.post('/api/agent', authenticateToken, async (req, res) => {
  try {
    const { niche, platform } = req.body;
    const template = `Act as an elite branding agent. A creator is building a {platform} presence in the {niche} niche.
    Generate:
    1. Three high-converting video hooks.
    2. A brief content strategy.
    3. A suggested modern color palette (provide Hex codes).`;
    
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(llm);
    const response = await chain.invoke({ niche, platform });

    // Save history
    const userIndex = users.findIndex(u => u.email === req.user.email);
    if (userIndex !== -1) {
      if (!users[userIndex].history) users[userIndex].history = [];
      users[userIndex].history.unshift({
        id: Date.now(),
        niche,
        platform,
        result: response.content,
        date: new Date().toLocaleDateString()
      });
      await saveDB(); // Save to file permanently
    }

    res.json({ result: response.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Agent failed to process request.' });
  }
});

app.get('/api/history', authenticateToken, (req, res) => {
  const user = users.find(u => u.email === req.user.email);
  res.json(user && user.history ? user.history : []);
});

app.listen(process.env.PORT, () => console.log(`Backend active on port ${process.env.PORT}`));