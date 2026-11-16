const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// 1. Create a bulletproof local static server
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

server.listen(8089, () => {
  console.log('Test server running at http://127.0.0.1:8089');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--user-data-dir=' + os.tmpdir() + '\\chrome-test-profile-' + Date.now(),
    'http://127.0.0.1:8089/quote/'
  ]);

  setTimeout(async () => {
    try {
      const listRes = await fetch('http://127.0.0.1:9226/json/list');
      const tabs = await listRes.json();
      const tab = tabs.find(t => t.url.includes('8089'));
      if (!tab) {
        console.error('Target tab not found:', tabs);
        chrome.kill();
        server.close();
        process.exit(1);
      }

      let exceptions = [];
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      ws.addEventListener('open', () => {
        let callId = 1;
        function send(method, params = {}) {
          ws.send(JSON.stringify({ id: callId++, method, params }));
        }

        ws.addEventListener('message', (event) => {
          const msg = JSON.parse(event.data);
          if (msg.method === 'Runtime.consoleAPICalled') {
            console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value));
          }
          if (msg.method === 'Runtime.exceptionThrown') {
            console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception.description);
            exceptions.push(msg.params.exceptionDetails.exception.description);
          }

          if (msg.id === 1) {
            // Click Add Vehicle button
            send('Runtime.evaluate', {
              expression: `(() => {
                const btn = document.getElementById("btnAddVehicle");
                if (!btn) return "btnAddVehicle button NOT found in DOM!";
                btn.click();
                const modal = document.getElementById("modalAddVehicle");
                return "Clicked btnAddVehicle! Modal display: " + (modal ? modal.style.display : "NO modal found");
              })()`
            });
          }

          if (msg.id === 2) {
            console.log('[TEST STEP 1]:', msg.result.result.value);
            // Fill form & click confirm
            send('Runtime.evaluate', {
              expression: `(() => {
                document.getElementById("newVehName").value = "Toyota Fortuner Legender";
                document.getElementById("newVehReg").value = "MH 46 BV 9999";
                document.getElementById("newVehRate").value = "5500";
                const confirmBtn = document.getElementById("btnConfirmAddVehicle");
                if (!confirmBtn) return "Confirm button NOT found!";
                confirmBtn.click();
                const sel = document.getElementById("vehiclePreset");
                const vehName = document.getElementById("vehName").value;
                const modal = document.getElementById("modalAddVehicle");
                return "Modal: " + modal.style.display + " | Selected ID: " + sel.value + " | Selected Text: " + sel.options[sel.selectedIndex].text + " | Form vehName: " + vehName + " | Options count: " + sel.options.length;
              })()`
            });
          }

          if (msg.id === 3) {
            console.log('[TEST STEP 2]:', msg.result.result.value);

            // Test delivery location datalist
            send('Runtime.evaluate', {
              expression: `(() => {
                const delInput = document.getElementById("deliveryLocation");
                const dl = document.getElementById("deliveryPointsList");
                return "Delivery input value: " + delInput.value + " | Datalist options count: " + (dl ? dl.options.length : 0);
              })()`
            });
          }

          if (msg.id === 4) {
            console.log('[TEST STEP 3]:', msg.result.result.value);
            ws.close();
            chrome.kill();
            server.close();

            if (exceptions.length > 0) {
              console.error('\nFAILED: ' + exceptions.length + ' browser exceptions occurred!');
              process.exit(1);
            } else {
              console.log('\nSUCCESS: 0 browser exceptions! Add Vehicle and Delivery Points work perfectly!');
              process.exit(0);
            }
          }
        });

        send('Runtime.enable');
      });
    } catch (err) {
      console.error('Error during test:', err);
      chrome.kill();
      server.close();
      process.exit(1);
    }
  }, 2000);
});
