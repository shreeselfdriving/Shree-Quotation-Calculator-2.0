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
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8092, () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--user-data-dir=' + os.tmpdir() + '\\chrome-test-calendar-' + Date.now(),
    'http://127.0.0.1:8092/calendar/'
  ]);

  setTimeout(async () => {
    try {
      const listRes = await fetch('http://127.0.0.1:9232/json/list');
      const tabs = await listRes.json();
      const tab = tabs.find(t => t.url.includes('8092'));
      const ws = new WebSocket(tab.webSocketDebuggerUrl);

      ws.addEventListener('open', () => {
        let callId = 1;
        function send(method, params = {}) {
          ws.send(JSON.stringify({ id: callId++, method, params }));
        }

        ws.addEventListener('message', (event) => {
          const msg = JSON.parse(event.data);
          if (msg.method === 'Runtime.consoleAPICalled') {
            console.log('[BROWSER LOG]', msg.params.type, msg.params.args.map(a => a.value));
          }
          if (msg.method === 'Runtime.exceptionThrown') {
            console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception.description);
          }

          if (msg.id === 1) {
            // Click "+ New Advance Booking" button
            send('Runtime.evaluate', {
              expression: `(() => {
                const btn = document.getElementById("btnOpenNewBooking");
                if (!btn) return "btnOpenNewBooking NOT found!";
                btn.click();
                const modal = document.getElementById("modalBooking");
                return "Clicked + New Advance Booking! Modal display: " + modal.style.display;
              })()`
            });
          }

          if (msg.id === 2) {
            console.log('[STEP 1 - OPEN BOOKING MODAL]:', msg.result.result.value);
            // Fill booking form and click submit
            send('Runtime.evaluate', {
              expression: `(() => {
                document.getElementById("bCustomerName").value = "Amit Deshmukh";
                document.getElementById("bCustomerPhone").value = "9876543210";
                document.getElementById("bVehicleName").value = "Maruti Swift VXi";
                document.getElementById("bPickupDate").value = "2026-11-20";
                document.getElementById("bPickupTime").value = "10:00";
                document.getElementById("bReturnDate").value = "2026-11-22";
                document.getElementById("bReturnTime").value = "20:00";
                document.getElementById("bTotalAmount").value = "5000";
                document.getElementById("bTokenAmount").value = "1000";
                document.getElementById("bLocation").value = "Panvel Station";

                // Now submit form
                const form = document.getElementById("formBooking");
                // Submit via form submit button
                const saveBtn = document.getElementById("btnSaveBooking");
                saveBtn.click();

                const modal = document.getElementById("modalBooking");
                return "Submitted booking form! Modal display: " + modal.style.display;
              })()`
            });
          }

          if (msg.id === 3) {
            console.log('[STEP 2 - SUBMIT BOOKING FORM]:', msg.result.result.value);
            send('Runtime.evaluate', {
              expression: `(() => {
                const bookings = JSON.parse(localStorage.getItem("sdr-bookings") || "[]");
                return "Bookings count in localStorage: " + bookings.length + " | Latest: " + (bookings[0] ? bookings[0].customerName : "none");
              })()`
            });
          }

          if (msg.id === 4) {
            console.log('[STEP 3 - LOCALSTORAGE CHECK]:', msg.result.result.value);
            ws.close();
            chrome.kill();
            server.close();
            process.exit(0);
          }
        });

        send('Runtime.enable');
      });
    } catch (e) {
      console.error('Error:', e);
      chrome.kill();
      server.close();
      process.exit(1);
    }
  }, 2500);
});
