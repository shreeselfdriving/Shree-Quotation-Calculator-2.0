const { spawn } = require('child_process');
const os = require('os');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--user-data-dir=' + os.tmpdir() + '\\chrome-test-profile-' + Date.now(),
  'https://shreeselfdriving.github.io/Shree-Quotation-Calculator-2.0/quote/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9225/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('shreeselfdriving'));
    if (!tab) {
      console.log('Target tab not found. Found:', tabs.map(t => t.url));
      chrome.kill();
      process.exit(1);
    }
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
          console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception);
        }
        if (msg.id === 1) {
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
          send('Runtime.evaluate', {
            expression: `(() => {
              document.getElementById("newVehName").value = "Mahindra Thar ROXX";
              document.getElementById("newVehRate").value = "4500";
              const confirmBtn = document.getElementById("btnConfirmAddVehicle");
              if (!confirmBtn) return "Confirm button NOT found!";
              confirmBtn.click();
              const sel = document.getElementById("vehiclePreset");
              const vehName = document.getElementById("vehName").value;
              const modal = document.getElementById("modalAddVehicle");
              return "Modal: " + modal.style.display + " | Selected: " + sel.value + " | vehName field: " + vehName + " | Options: " + sel.options.length;
            })()`
          });
        }
        if (msg.id === 3) {
          console.log('[TEST STEP 2]:', msg.result.result.value);
          ws.close();
          chrome.kill();
          process.exit(0);
        }
      });
      send('Runtime.enable');
    });
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 3500);
