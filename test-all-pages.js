const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  
  let filePath = path.join(__dirname, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8090, async () => {
  const pages = ['/', '/quote/', '/calendar/', '/invoice/'];
  let totalErrors = 0;

  for (const page of pages) {
    console.log(`\n--- Testing page: ${page} ---`);
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--remote-debugging-port=9227',
      '--user-data-dir=' + os.tmpdir() + '\\chrome-prof-' + Date.now(),
      `http://127.0.0.1:8090${page}`
    ]);

    await new Promise(r => setTimeout(r, 2000));
    try {
      const listRes = await fetch('http://127.0.0.1:9227/json/list');
      const tabs = await listRes.json();
      const tab = tabs.find(t => t.url.includes('8090'));
      if (!tab) {
        console.error('Tab not found for', page);
        chrome.kill();
        continue;
      }

      let pageExceptions = [];
      await new Promise((resolve) => {
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        ws.addEventListener('open', () => {
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: 'document.title' } }));
        });
        ws.addEventListener('message', (event) => {
          const msg = JSON.parse(event.data);
          if (msg.method === 'Runtime.exceptionThrown') {
            console.error('  [EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception.description);
            pageExceptions.push(msg.params.exceptionDetails.exception.description);
          }
          if (msg.id === 2) {
            console.log(`  Page Title: "${msg.result.result.value}"`);
            setTimeout(() => {
              ws.close();
              resolve();
            }, 500);
          }
        });
      });

      chrome.kill();
      if (pageExceptions.length > 0) {
        console.error(`  ❌ FAILED on ${page}: ${pageExceptions.length} exceptions!`);
        totalErrors += pageExceptions.length;
      } else {
        console.log(`  ✅ PASSED: 0 exceptions on ${page}`);
      }
    } catch (e) {
      console.error('Error on page', page, e.message);
      chrome.kill();
      totalErrors++;
    }
  }

  server.close();
  console.log(`\n========================================`);
  console.log(`ALL PAGES AUDIT: ${totalErrors === 0 ? 'ALL PASSED (0 ERRORS)' : 'FAILED WITH ' + totalErrors + ' ERRORS'}`);
  console.log(`========================================`);
  process.exit(totalErrors === 0 ? 0 : 1);
});
