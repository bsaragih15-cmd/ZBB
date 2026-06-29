const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, '..', '..', 'dist')
const PORT = 5050
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon' }

const ANSWER =
`MEB+DEB sits at $54.6/kW-yr versus MRPR's $45 — the widest spread in the fleet, about Rp 25 Bn at stake. ` +
`The gap concentrates in Maintenance Cost and Salary & Allowance. ` +
`Challenge the owner: what scope or headcount justifies the premium over MRPR, and which of it is contractual versus discretionary?`

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/copilot') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' })
    const words = ANSWER.split(' ')
    for (const w of words) {
      res.write(w + ' ')
      await new Promise(r => setTimeout(r, 45))
    }
    res.end()
    return
  }
  let p = decodeURIComponent(req.url.split('?')[0])
  if (p === '/') p = '/index.html'
  let file = path.join(DIST, p)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html')
  const ext = path.extname(file)
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
server.listen(PORT, () => console.log('serving dist on http://localhost:' + PORT))
