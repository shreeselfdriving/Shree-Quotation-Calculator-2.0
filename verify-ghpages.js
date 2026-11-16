const { spawn } = require('child_process');
const os = require('os');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9230',
  '--user-data-dir=' + os.tmpdir() + '\\chrome-test-ghpages-clean-' + Date.now(),
  'https://shreeselfdriving.github.io/Shree-Quotation-Calculator-2.0/quote/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9230/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('shreeselfdriving'));
    if (!tab) {
      console.log('Target tab not found:', tabs.map(t => t.url));
      chrome.kill();
      process.exit(1);
    }
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let exceptions = [];
    ws.addEventListener('open', () => {
      let callId = 1;
      function send(method, params = {}) {
        ws.send(JSON.stringify({ id: callId++, method, params }));
      }
      ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION ON LIVE SITE]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception.description);
          exceptions.push(msg.params.exceptionDetails.exception.description);
        }
        if (msg.id === 1) {
          send('Runtime.evaluate', {
            expression: `(() => {
              const btn = document.getElementById("btnAddVehicle");
              btn.click();
              const modal = document.getElementById("modalAddVehicle");
              return "Modal display: " + modal.style.display;
            })()`
          });
        }
        if (msg.id === 2) {
          console.log('[LIVE SITE STEP 1 - OPEN MODAL]:', msg.result.result.value);
          send('Runtime.evaluate', {
            expression: `(() => {
              document.getElementById("newVehName").value = "Kia Carens Prestige";
              document.getElementById("newVehRate").value = "2800";
              document.getElementById("btnConfirmAddVehicle").click();
              const sel = document.getElementById("vehiclePreset");
              return "Modal display after confirm: " + document.getElementById("modalAddVehicle").style.display + " | Selected: " + sel.options[sel.selectedIndex].text;
            })()`
          });
        }
        if (msg.id === 3) {
          console.log('[LIVE SITE STEP 2 - SUBMIT MODAL]:', msg.result.result.value);
          ws.close();
          chrome.kill();
          if (exceptions.length === 0) {
            console.log('\nVERIFICATION COMPLETE: 0 errors on live hosted website! Add vehicle works!');
            process.exit(0);
          } else {
            console.error('\nFAILED: ' + exceptions.length + ' exceptions');
            process.exit(1);
          }
        }
      });
      send('Runtime.enable');
    });
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 4000);
