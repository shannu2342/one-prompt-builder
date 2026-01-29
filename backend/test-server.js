// Simple test server to verify Node.js and Express work
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Test server is running!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`Test it: http://localhost:${PORT}/health`);
});
