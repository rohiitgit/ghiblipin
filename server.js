require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Pass Supabase credentials to client-side securely
app.get('/api/config', (req, res) => {
  // Only share what the client needs
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY
  });
});

// Serve the main HTML file for the root path - either login or index
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

// Explicitly serve the main app
app.get('/index.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Explicitly serve the login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

// Add special handling for auth callbacks
app.get('/auth/callback', (req, res) => {
  console.log('Auth callback received, redirecting to app');
  res.redirect('/index.html');
});

// Fallback - serve the main HTML file for all other routes
app.get('*', (req, res) => {
  // If it's an API-looking route or auth route, direct to index
  if (req.path.includes('/api/') || req.path.includes('/auth/')) {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  } else {
    // Otherwise show login
    res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});