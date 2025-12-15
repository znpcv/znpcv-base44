import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Download } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

export default function CodeExportPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [copiedSection, setCopiedSection] = useState(null);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    bgCode: darkMode ? 'bg-zinc-900' : 'bg-zinc-100',
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const codeFiles = {
    backend: {
      'server.js': `// Backend Server - Express + PostgreSQL
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashedPassword, full_name, 'user']
    );
    
    const token = jwt.sign({ id: result.rows[0].id, email }, process.env.JWT_SECRET);
    res.json({ token, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, created_date FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TRADE CHECKLIST ROUTES
app.get('/api/checklists', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trade_checklists WHERE created_by = $1 ORDER BY created_date DESC',
      [req.user.email]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/checklists/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trade_checklists WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user.email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/checklists', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const result = await pool.query(
      \`INSERT INTO trade_checklists (
        pair, direction, trade_date, w_trend, w_at_aoi, w_ema_touch, w_candlestick, 
        w_psp_rejection, w_round_level, w_swing, w_pattern, d_trend, d_at_aoi, 
        d_ema_touch, d_candlestick, d_psp_rejection, d_round_level, d_swing, d_pattern,
        h4_trend, h4_at_aoi, h4_candlestick, h4_psp_rejection, h4_swing, h4_pattern,
        entry_sos, entry_engulfing, entry_pattern, entry_type, entry_price, stop_loss,
        take_profit, account_size, risk_percent, leverage, confirms_rule, notes,
        screenshots, outcome, actual_pnl, exit_date, status, completion_percentage,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44
      ) RETURNING *\`,
      [
        data.pair, data.direction, data.trade_date, data.w_trend, data.w_at_aoi,
        data.w_ema_touch, data.w_candlestick, data.w_psp_rejection, data.w_round_level,
        data.w_swing, data.w_pattern, data.d_trend, data.d_at_aoi, data.d_ema_touch,
        data.d_candlestick, data.d_psp_rejection, data.d_round_level, data.d_swing,
        data.d_pattern, data.h4_trend, data.h4_at_aoi, data.h4_candlestick,
        data.h4_psp_rejection, data.h4_swing, data.h4_pattern, data.entry_sos,
        data.entry_engulfing, data.entry_pattern, data.entry_type, data.entry_price,
        data.stop_loss, data.take_profit, data.account_size, data.risk_percent,
        data.leverage, data.confirms_rule, data.notes, JSON.stringify(data.screenshots || []),
        data.outcome, data.actual_pnl, data.exit_date, data.status,
        data.completion_percentage, req.user.email
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/checklists/:id', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const result = await pool.query(
      \`UPDATE trade_checklists SET
        pair = $1, direction = $2, trade_date = $3, w_trend = $4, w_at_aoi = $5,
        w_ema_touch = $6, w_candlestick = $7, w_psp_rejection = $8, w_round_level = $9,
        w_swing = $10, w_pattern = $11, d_trend = $12, d_at_aoi = $13, d_ema_touch = $14,
        d_candlestick = $15, d_psp_rejection = $16, d_round_level = $17, d_swing = $18,
        d_pattern = $19, h4_trend = $20, h4_at_aoi = $21, h4_candlestick = $22,
        h4_psp_rejection = $23, h4_swing = $24, h4_pattern = $25, entry_sos = $26,
        entry_engulfing = $27, entry_pattern = $28, entry_type = $29, entry_price = $30,
        stop_loss = $31, take_profit = $32, account_size = $33, risk_percent = $34,
        leverage = $35, confirms_rule = $36, notes = $37, screenshots = $38,
        outcome = $39, actual_pnl = $40, exit_date = $41, status = $42,
        completion_percentage = $43, updated_date = NOW()
      WHERE id = $44 AND created_by = $45 RETURNING *\`,
      [
        data.pair, data.direction, data.trade_date, data.w_trend, data.w_at_aoi,
        data.w_ema_touch, data.w_candlestick, data.w_psp_rejection, data.w_round_level,
        data.w_swing, data.w_pattern, data.d_trend, data.d_at_aoi, data.d_ema_touch,
        data.d_candlestick, data.d_psp_rejection, data.d_round_level, data.d_swing,
        data.d_pattern, data.h4_trend, data.h4_at_aoi, data.h4_candlestick,
        data.h4_psp_rejection, data.h4_swing, data.h4_pattern, data.entry_sos,
        data.entry_engulfing, data.entry_pattern, data.entry_type, data.entry_price,
        data.stop_loss, data.take_profit, data.account_size, data.risk_percent,
        data.leverage, data.confirms_rule, data.notes, JSON.stringify(data.screenshots || []),
        data.outcome, data.actual_pnl, data.exit_date, data.status,
        data.completion_percentage, req.params.id, req.user.email
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/checklists/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM trade_checklists WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user.email]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,

      'database.sql': `-- PostgreSQL Database Schema

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  profile_image TEXT,
  bio TEXT,
  phone VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  postal_code VARCHAR(20),
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trade_checklists (
  id SERIAL PRIMARY KEY,
  pair VARCHAR(50) NOT NULL,
  direction VARCHAR(10),
  trade_date DATE,
  
  -- Weekly Analysis
  w_trend VARCHAR(20),
  w_at_aoi BOOLEAN,
  w_ema_touch BOOLEAN,
  w_candlestick BOOLEAN,
  w_psp_rejection BOOLEAN,
  w_round_level BOOLEAN,
  w_swing BOOLEAN,
  w_pattern VARCHAR(50),
  
  -- Daily Analysis
  d_trend VARCHAR(20),
  d_at_aoi BOOLEAN,
  d_ema_touch BOOLEAN,
  d_candlestick BOOLEAN,
  d_psp_rejection BOOLEAN,
  d_round_level BOOLEAN,
  d_swing BOOLEAN,
  d_pattern VARCHAR(50),
  
  -- 4H Analysis
  h4_trend VARCHAR(20),
  h4_at_aoi BOOLEAN,
  h4_candlestick BOOLEAN,
  h4_psp_rejection BOOLEAN,
  h4_swing BOOLEAN,
  h4_pattern VARCHAR(50),
  
  -- Entry
  entry_sos BOOLEAN,
  entry_engulfing BOOLEAN,
  entry_pattern VARCHAR(50),
  entry_type VARCHAR(50),
  entry_price VARCHAR(50),
  stop_loss VARCHAR(50),
  take_profit VARCHAR(50),
  
  -- Risk Management
  account_size VARCHAR(50),
  risk_percent VARCHAR(50),
  leverage VARCHAR(50) DEFAULT '100',
  
  -- Final
  confirms_rule BOOLEAN,
  notes TEXT,
  screenshots JSONB,
  
  -- Outcome
  outcome VARCHAR(20) DEFAULT 'pending',
  actual_pnl VARCHAR(50),
  exit_date DATE,
  
  -- Meta
  status VARCHAR(50) DEFAULT 'in_progress',
  completion_percentage NUMERIC,
  created_by VARCHAR(255),
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checklists_user ON trade_checklists(created_by);
CREATE INDEX idx_checklists_date ON trade_checklists(trade_date);
CREATE INDEX idx_checklists_status ON trade_checklists(status);`,

      'package.json': `{
  "name": "znpcv-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}`,

      '.env.example': `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/znpcv

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.com`
    },
    
    frontend: {
      'api-client.js': `// Frontend API Client - Replace Base44 SDK

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Get auth token
const getToken = () => localStorage.getItem('auth_token');

// Axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Auth API
export const auth = {
  register: async (email, password, full_name) => {
    const { data } = await api.post('/auth/register', { email, password, full_name });
    localStorage.setItem('auth_token', data.token);
    return data.user;
  },
  
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    return data.user;
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  },
  
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  
  isAuthenticated: () => {
    return !!getToken();
  },
  
  redirectToLogin: () => {
    window.location.href = '/login';
  },
  
  updateMe: async (userData) => {
    const { data } = await api.put('/auth/me', userData);
    return data;
  }
};

// Checklist API
export const checklists = {
  list: async () => {
    const { data } = await api.get('/checklists');
    return data;
  },
  
  get: async (id) => {
    const { data } = await api.get(\`/checklists/\${id}\`);
    return data;
  },
  
  create: async (checklistData) => {
    const { data } = await api.post('/checklists', checklistData);
    return data;
  },
  
  update: async (id, checklistData) => {
    const { data } = await api.put(\`/checklists/\${id}\`, checklistData);
    return data;
  },
  
  delete: async (id) => {
    const { data } = await api.delete(\`/checklists/\${id}\`);
    return data;
  }
};

// Export combined API
export const apiClient = {
  auth,
  entities: {
    TradeChecklist: checklists
  }
};`,

      '.env.example': `# Frontend Environment Variables
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NAME=ZNPCV Trading Checklist`
    },

    deployment: {
      'railway.json': `{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}`,

      'Dockerfile': `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]`,

      'railway-setup.md': `# Railway Deployment Guide

## 1. Vorbereitung
- GitHub Account erstellen
- Railway Account erstellen (railway.app)
- Code in GitHub Repository pushen

## 2. PostgreSQL Datenbank erstellen
1. Railway Dashboard öffnen
2. "New Project" -> "Provision PostgreSQL"
3. Connection String kopieren

## 3. Backend deployen
1. "New Service" -> "GitHub Repo"
2. Repository auswählen
3. Environment Variables setzen:
   - DATABASE_URL: [PostgreSQL Connection String]
   - JWT_SECRET: [Generierter Secret Key]
   - NODE_ENV: production
4. Deploy abwarten

## 4. Datenbank initialisieren
1. Railway Dashboard -> PostgreSQL
2. "Query" Tab öffnen
3. database.sql Content einfügen und ausführen

## 5. Frontend anpassen
1. In deinem Frontend Projekt:
2. .env erstellen mit:
   REACT_APP_API_URL=https://[your-backend].railway.app/api
3. Build erstellen: npm run build
4. Deploy auf Vercel/Netlify

## 6. Testen
- Backend API: https://[your-backend].railway.app/api/auth/me
- Frontend: https://[your-frontend].vercel.app

## Kosten
- ~$5-10/Monat für Backend + Database
- Frontend auf Vercel: Kostenlos`
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <button 
                onClick={() => navigate(createPageUrl('Home'))}
                className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'} border-2 rounded-xl p-2.5 transition-all`}>
                <ArrowLeft className={`w-5 h-5 ${theme.text}`} />
              </button>
            </div>
            <h1 className="text-2xl tracking-widest">CODE EXPORT</h1>
            <div className="w-[84px]" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className={`${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-100/50'} rounded-2xl p-6 mb-8 border-2 ${theme.border}`}>
          <div className="flex items-start gap-4">
            <Download className="w-8 h-8 text-teal-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl tracking-wider mb-3">VOLLSTÄNDIGES BACKEND + FRONTEND PACKAGE</h2>
              <p className={`${theme.textSecondary} text-sm leading-relaxed mb-4`}>
                Hier findest du alle notwendigen Code-Dateien für ein selbst-gehostetes System. 
                Kopiere jeden Abschnitt und erstelle die entsprechenden Dateien lokal.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-teal-600/20 text-teal-600 rounded-lg text-xs">Express Backend</span>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-600 rounded-lg text-xs">PostgreSQL</span>
                <span className="px-3 py-1 bg-purple-600/20 text-purple-600 rounded-lg text-xs">JWT Auth</span>
                <span className="px-3 py-1 bg-orange-600/20 text-orange-600 rounded-lg text-xs">Railway Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Section */}
        <section className="mb-12">
          <h2 className="text-xl tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-teal-600 rounded-full" />
            BACKEND FILES
          </h2>
          <div className="space-y-4">
            {Object.entries(codeFiles.backend).map(([filename, code]) => (
              <div key={filename} className={`${darkMode ? 'bg-zinc-900' : 'bg-white'} rounded-xl border-2 ${theme.border} overflow-hidden`}>
                <div className="flex items-center justify-between px-4 py-3 border-b ${theme.border}">
                  <span className="font-mono text-sm">{filename}</span>
                  <button
                    onClick={() => copyToClipboard(code, filename)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700 transition-colors"
                  >
                    {copiedSection === filename ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopieren
                      </>
                    )}
                  </button>
                </div>
                <pre className={`${theme.bgCode} p-4 overflow-x-auto text-xs leading-relaxed`}>
                  <code>{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Frontend Section */}
        <section className="mb-12">
          <h2 className="text-xl tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            FRONTEND FILES
          </h2>
          <div className="space-y-4">
            {Object.entries(codeFiles.frontend).map(([filename, code]) => (
              <div key={filename} className={`${darkMode ? 'bg-zinc-900' : 'bg-white'} rounded-xl border-2 ${theme.border} overflow-hidden`}>
                <div className="flex items-center justify-between px-4 py-3 border-b ${theme.border}">
                  <span className="font-mono text-sm">{filename}</span>
                  <button
                    onClick={() => copyToClipboard(code, filename)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copiedSection === filename ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopieren
                      </>
                    )}
                  </button>
                </div>
                <pre className={`${theme.bgCode} p-4 overflow-x-auto text-xs leading-relaxed`}>
                  <code>{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Deployment Section */}
        <section className="mb-12">
          <h2 className="text-xl tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-600 rounded-full" />
            DEPLOYMENT FILES
          </h2>
          <div className="space-y-4">
            {Object.entries(codeFiles.deployment).map(([filename, code]) => (
              <div key={filename} className={`${darkMode ? 'bg-zinc-900' : 'bg-white'} rounded-xl border-2 ${theme.border} overflow-hidden`}>
                <div className="flex items-center justify-between px-4 py-3 border-b ${theme.border}">
                  <span className="font-mono text-sm">{filename}</span>
                  <button
                    onClick={() => copyToClipboard(code, filename)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition-colors"
                  >
                    {copiedSection === filename ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopieren
                      </>
                    )}
                  </button>
                </div>
                <pre className={`${theme.bgCode} p-4 overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap`}>
                  <code>{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <div className={`${darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-100 border-orange-300'} border-2 rounded-2xl p-6`}>
          <h3 className="text-lg tracking-wider mb-4 text-orange-600">⚠️ WICHTIGE HINWEISE</h3>
          <ul className={`${theme.textSecondary} space-y-2 text-sm`}>
            <li>• Erstelle einen neuen Ordner für dein Backend-Projekt</li>
            <li>• Kopiere alle Backend-Dateien in diesen Ordner</li>
            <li>• Führe <code className={`${theme.bgCode} px-2 py-1 rounded`}>npm install</code> aus</li>
            <li>• Erstelle die .env Datei mit deinen Werten</li>
            <li>• Erstelle die PostgreSQL Datenbank mit database.sql</li>
            <li>• Frontend: Ersetze alle <code className={`${theme.bgCode} px-2 py-1 rounded`}>base44</code> Imports mit <code className={`${theme.bgCode} px-2 py-1 rounded`}>apiClient</code></li>
            <li>• Deploye Backend auf Railway (siehe railway-setup.md)</li>
            <li>• Deploye Frontend auf Vercel/Netlify</li>
          </ul>
        </div>
      </main>
    </div>
  );
}