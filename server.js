// Zero-dependency server. Makes data every 2s, saves to sensor_data.json, serves website.
const http = require('http'), fs = require('fs'), path = require('path');
const { tick } = require('./sim.js');

let latest = tick();
const history = [latest];
const FILE = path.join(__dirname, 'sensor_data.json');

setInterval(() => {
  latest = tick();
  history.push(latest);
  if (history.length > 200) history.shift();
  fs.writeFileSync(FILE, JSON.stringify({ latest, history }, null, 2));
}, 2000);

const types = { '.html': 'text/html', '.js': 'text/javascript' };
http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(latest));
  }
  const f = url === '/' ? 'index.html' : url.slice(1);
  if (!['index.html', 'sim.js'].includes(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] });
  res.end(fs.readFileSync(path.join(__dirname, f)));
}).listen(3000, () => console.log('Smart City Hub: http://localhost:3000  (data saved in sensor_data.json)'));
