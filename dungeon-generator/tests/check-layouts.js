// Every symmetry x paths x arrangement x shape combination: rooms reachable from the entrance, room count, floor symmetry score, time.
// Run: node dungeon-generator/tests/check-layouts.js   (needs Playwright with Chromium)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html')); await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    const reach = (m) => {
      const { W, cells } = m, doors = new Set(m.doors.map(d => d.o + d.x + ',' + d.y));
      const caves = new Set(m.rooms.filter(r => r.shape.type === 'cave').map(r => r.id));
      const start = m.rooms.find(r => r.num === 1); const seen = new Uint8Array(cells.length);
      const st = [Math.floor(start.lx), Math.floor(start.ly)]; const q = [st]; seen[st[1] * W + st[0]] = 1;
      while (q.length) { const [x, y] = q.pop(); const a = cells[y * W + x];
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, bb = cells[ny * W + nx]; if (!bb || bb === -2 || seen[ny * W + nx] || (m.wet && m.wet[ny * W + nx] === 1)) continue;
          const key = dx ? 'v' + Math.max(x, nx) + ',' + y : 'h' + x + ',' + Math.max(y, ny);
          const tunnel = (a === -1 && caves.has(bb) && m.tunnels[y * W + x]) || (bb === -1 && caves.has(a) && m.tunnels[ny * W + nx]);
          if (a !== bb && !doors.has(key) && !(caves.has(a) && caves.has(bb)) && !tunnel) continue; seen[ny * W + nx] = 1; q.push([nx, ny]); } }
      return m.rooms.filter(r => !seen[Math.floor(r.ly) * W + Math.floor(r.lx)] && !seen[r.y * W + r.x]).length;
    };
    const symScore = (m) => { // share of floor-mask pixels whose mirror is also floor, about the best vertical axis
      let best = 0; const { mw, mh, mask, R } = m;
      for (let ax2 = 0; ax2 < mw * 2; ax2 += 4) { let f = 0, both = 0;
        for (let y = 0; y < mh; y += 2) for (let x = 0; x < mw; x += 2) { if (!mask[y * mw + x]) continue; f++; const xm = ax2 - x - 1; if (xm >= 0 && xm < mw && mask[y * mw + xm]) both++; }
        if (f && both / f > best) best = both / f; }
      return best;
    };
    const res = {};
    for (const symmetry of ['none', 'partial', 'full']) for (const paths of ['branch', 'mixed', 'loop']) {
      const key = symmetry + '/' + paths; const r = res[key] = { maps: 0, unreach: 0, short: 0, sym: 0, cyc: 0, worst: 0 };
      for (const layout of ['shared', 'halls', 'mixed', 'scattered']) for (const shapes of ['rect', 'many', 'caves']) for (const rooms of [9, 24]) for (let i = 0; i < 2; i++) {
        const o = layoutOpts(); Object.assign(o, { layout, shapes, rooms, symmetry, paths, seed: `s-${key}-${layout}-${shapes}-${rooms}-${i}`, water: 0.3 });
        const t0 = performance.now(); const m = generate(o); r.worst = Math.max(r.worst, performance.now() - t0);
        r.maps++; r.unreach += reach(m); if (m.rooms.length < rooms * 0.75) r.short++; r.sym += symScore(m); if (m.cycle) r.cyc++;
      }
      r.sym = +(r.sym / r.maps).toFixed(3); r.worst = Math.round(r.worst);
    }
    return res;
  });
  for (const [k, v] of Object.entries(out)) console.log(k.padEnd(14), JSON.stringify(v));
  console.log(errs.slice(0, 5)); await b.close();
})();
