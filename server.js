const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// In-memory data store for team progress
// Maps team_name (string) -> floor (number)
const teamProgress = {};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set default content type to JSON
  res.setHeader('Content-Type', 'application/json');

  // Add CORS headers so a front-end can communicate with the server if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. GET /config - serves config.json
  if (pathname === '/config' && method === 'GET') {
    const configPath = path.join(__dirname, 'config.json');
    fs.readFile(configPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to read config.json' }));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
    return;
  }

  // 2. GET /update_progress?team_name=<string>&floor=<number>
  if (pathname === '/update_progress') {
    const { team_name, floor } = parsedUrl.query;

    if (!team_name) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing required query parameter: team_name' }));
      return;
    }

    if (floor === undefined || floor === null || floor === '') {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing required query parameter: floor' }));
      return;
    }

    const floorNum = Number(floor);
    if (isNaN(floorNum)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Parameter floor must be a valid number' }));
      return;
    }

    // Update in-memory database
    teamProgress[team_name] = floorNum;

    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: `Progress updated for team '${team_name}' to floor ${floorNum}`,
      progress: teamProgress
    }));
    return;
  }

  // 3. GET /progress - returns a map of team names to floor progress
  if (pathname === '/progress' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(teamProgress));
    return;
  }

  // 4. Serve static files for GET requests
  if (method === 'GET') {
    const relativePath = pathname === '/' ? '/index.html' : pathname;
    const resolvedDir = path.resolve(__dirname);
    const safePath = path.resolve(path.join(resolvedDir, relativePath));

    // Security check: ensure path is within __dirname
    if (!safePath.startsWith(resolvedDir)) {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Access Denied' }));
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to 404 response
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
      }

      // Determine content type
      const ext = path.extname(safePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(safePath);
      stream.on('error', (streamErr) => {
        res.end();
      });
      stream.pipe(res);
    });
    return;
  }

  // Fallback for page not found
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
