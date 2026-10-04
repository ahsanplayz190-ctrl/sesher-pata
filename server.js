const { createServer } = require('http');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Force production mode unless explicitly set to development
const dev = process.env.NODE_ENV === 'development';
const app = next({ 
  dev, 
  dir: __dirname 
});
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT, 10) || 3000;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;

      // Direct static asset serving for Next.js build chunks (CSS, JS, Fonts, Media)
      // Ensures assets load even behind reverse proxies, cPanel Passenger, or Apache
      if (pathname && pathname.startsWith('/_next/static/')) {
        const relativePath = pathname.replace(/^\/_next\/static\//, '');
        const filePath = path.join(__dirname, '.next', 'static', relativePath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return fs.createReadStream(filePath).pipe(res);
        }
      }

      // Direct static file serving for public folder assets (/images/, /favicon.ico, etc.)
      if (pathname && (pathname.startsWith('/images/') || pathname === '/favicon.ico' || pathname === '/robots.txt')) {
        const filePath = path.join(__dirname, 'public', pathname);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return fs.createReadStream(filePath).pipe(res);
        }
      }

      // Default Next.js request handler
      handle(req, res);
    } catch (err) {
      console.error('Request handling error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Shesher Pata server ready on port ${port} [mode: ${dev ? 'development' : 'production'}]`);
  });
}).catch((err) => {
  console.error('> Server startup error:', err);
  process.exit(1);
});

