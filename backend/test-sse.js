// Simple test script to verify SSE endpoint
const http = require('http');

// Test SSE endpoint
const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5001,
  path: '/api/events/updates',
  method: 'GET',
  headers: {
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache'
  }
};

const req = http.request(options, (res) => {
  console.log(`SSE Status: ${res.statusCode}`);
  console.log('SSE Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('SSE Data:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('SSE Connection ended');
  });
});

req.on('error', (e) => {
  console.error(`SSE Error: ${e.message}`);
});

req.end();

console.log('Testing SSE endpoint...');
