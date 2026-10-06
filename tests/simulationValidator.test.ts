import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSimulationHTML } from '@/app/dashboard/content/utils/simulationValidator';

describe('TICKET-08: Simulation Bridge & Contract Validator (§R1 & R5)', () => {
  const fullyCompliantHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Optics Ray Simulation</title>
      </head>
      <body>
        <canvas id="sim"></canvas>
        <script>
          function handleNext() { console.log('next step'); }
          function handleBack() { console.log('back step'); }
          function onNativeParams(p) { console.log(p); }
          function reportState(val) {
            if (window.AndroidBridge) {
              window.AndroidBridge.postState(JSON.stringify({ angle: val }));
              window.AndroidBridge.triggerHapticClick();
            }
          }
        </script>
      </body>
    </html>
  `;

  it('passes valid simulation HTML with 0 errors and 0 warnings', () => {
    const res = validateSimulationHTML(fullyCompliantHTML, 1024 * 50);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.warnings.length, 0);
  });

  it('fails simulation missing handleNext, handleBack, and AndroidBridge', () => {
    const bareHTML = '<html><body><h1>Bare Simulation</h1></body></html>';
    const res = validateSimulationHTML(bareHTML);
    assert.equal(res.valid, false);
    assert.equal(res.errors.length, 3);
    assert.ok(res.errors.some((e) => e.includes('handleNext')));
    assert.ok(res.errors.some((e) => e.includes('handleBack')));
    assert.ok(res.errors.some((e) => e.includes('AndroidBridge')));
  });

  it('flags warning when external network fetch() is detected', () => {
    const fetchHTML = `
      ${fullyCompliantHTML}
      <script>
        fetch('https://api.example.com/data').then(r => r.json());
      </script>
    `;
    const res = validateSimulationHTML(fetchHTML);
    assert.equal(res.valid, true);
    assert.ok(res.warnings.some((w) => w.includes('External network calls') && w.includes('fetch')));
  });

  it('flags warning when XMLHttpRequest is detected', () => {
    const xhrHTML = `
      ${fullyCompliantHTML}
      <script>
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/data');
      </script>
    `;
    const res = validateSimulationHTML(xhrHTML);
    assert.equal(res.valid, true);
    assert.ok(res.warnings.some((w) => w.includes('XMLHttpRequest')));
  });

  it('flags warnings for missing recommended callbacks (postState, onNativeParams, triggerHapticClick)', () => {
    const minimalRequiredHTML = `
      <script>
        function handleNext() {}
        function handleBack() {}
        const b = window.AndroidBridge;
      </script>
    `;
    const res = validateSimulationHTML(minimalRequiredHTML);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
    assert.ok(res.warnings.some((w) => w.includes('postState')));
    assert.ok(res.warnings.some((w) => w.includes('onNativeParams')));
    assert.ok(res.warnings.some((w) => w.includes('triggerHapticClick')));
  });

  it('flags file size warnings when HTML exceeds 200KB or package exceeds 5MB', () => {
    const largeHTML = fullyCompliantHTML + ' '.repeat(205 * 1024);
    const resLargeHTML = validateSimulationHTML(largeHTML, 1024);
    assert.ok(resLargeHTML.warnings.some((w) => w.includes('200KB')));

    const resLargePkg = validateSimulationHTML(fullyCompliantHTML, 6 * 1024 * 1024);
    assert.ok(resLargePkg.warnings.some((w) => w.includes('5MB')));
  });
});
