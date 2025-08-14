import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
 
const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'

// Force no cache for dynamic content
const app = next({ 
  dev,
  customServer: true,
  conf: {
    compress: false, // Disable compression to ensure fresh content
  }
})
const handle = app.getRequestHandler()
 
app.prepare().then(() => {
  createServer((req, res) => {
    // Add headers to prevent caching of dynamic content
    if (req.url === '/' || req.url?.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    }
    
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) {
      console.error('Error starting server:', err)
      process.exit(1)
    }
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`
    )
  })
})