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

// Serve login page for the root path
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

// Serve the main app for specific paths
app.get('/index.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Handle OAuth redirects
app.get('/auth/callback', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Add a special route for handling callbacks
app.get('/auth/callback', (req, res) => {
  console.log('Auth callback received with params:', req.query);
  // Redirect to your app
  res.redirect('/index.html');
});

// Fallback - serve the appropriate file based on the path
app.get('*', (req, res) => {
  if (req.path.includes('auth') || req.path.includes('callback')) {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  } else {
    res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});