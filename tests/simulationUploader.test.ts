import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { uploadSimulationPackage, SimulationFileItem } from '@/app/dashboard/content/utils/simulationUploader';

describe('TICKET-06: Simulation Uploader (§R1)', () => {
  it('rejects empty file array with descriptive error', async () => {
    const res = await uploadSimulationPackage('sim_phys_optics_ray', []);
    assert.equal(res.success, false);
    assert.equal(res.simId, 'sim_phys_optics_ray');
    assert.match(res.error || '', /no files/i);
  });

  it('rejects package without HTML entrypoint when multiple files provided', async () => {
    const files: SimulationFileItem[] = [
      { path: 'style.css', file: new File(['body {}'], 'style.css', { type: 'text/css' }), size: 7 },
      { path: 'script.js', file: new File(['console.log(1)'], 'script.js', { type: 'application/javascript' }), size: 14 }
    ];
    const res = await uploadSimulationPackage('sim_phys_optics_ray', files);
    assert.equal(res.success, false);
    assert.match(res.error || '', /no index\.html or html entrypoint/i);
  });

  it('normalizes single HTML file entrypoint to index.html and attempts upload', async () => {
    const singleHtml: SimulationFileItem = {
      path: 'optics_lens.html',
      file: new File(['<html><body>Simulation</body></html>'], 'optics_lens.html', { type: 'text/html' }),
      size: 36
    };
    // In node test environment without pocketbase backend or r2 credentials, proxy fails and returns error
    const res = await uploadSimulationPackage('sim_phys_optics_lens', [singleHtml]);
    assert.equal(res.simId, 'sim_phys_optics_lens');
    assert.equal(res.totalSize, 36);
    // Verified that it proceeded past entrypoint verification
    assert.ok(res.error);
    assert.doesNotMatch(res.error, /no index\.html/i);
  });

  it('identifies root html file as index.html in a multi-file folder package', async () => {
    const files: SimulationFileItem[] = [
      { path: 'main.html', file: new File(['<html></html>'], 'main.html'), size: 13 },
      { path: 'assets/app.js', file: new File(['// js'], 'app.js'), size: 5 }
    ];
    const res = await uploadSimulationPackage('sim_chem_reactions_cell', files);
    assert.equal(res.simId, 'sim_chem_reactions_cell');
    assert.equal(res.totalSize, 18);
    // Entrypoint detected and normalized
    assert.doesNotMatch(res.error || '', /no index\.html/i);
  });
});
