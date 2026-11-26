// Rivers always on: every room (all its dry parts) must stay reachable from the entrance through crossings.
// Run: node dungeon-generator/tests/check-rivers.js   (needs Playwright with Chromium)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html')); await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    const reach = (m) => { // walk cells; crossing between regions only through a door
      const { W, H, cells } = m, doors = new Set(m.doors.map(d => d.o + d.x + ',' + d.y));
      const caves = new Set(m.rooms.filter(r => r.shape.type === 'cave').map(r => r.id));
      const start = m.rooms.find(r => r.num === 1); const seen = new Uint8Array(W * H);
      const q = [[Math.floor(start.lx), Math.floor(start.ly)]]; seen[q[0][1] * W + q[0][0]] = 1;
      while (q.length) { const [x, y] = q.pop(); const a = cells[y * W + x];
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, bb = cells[ny * W + nx]; if (!bb || bb === -2 || seen[ny * W + nx] || (m.wet && m.wet[ny * W + nx] === 1)) continue;
          const key = dx ? 'v' + Math.max(x, nx) + ',' + y : 'h' + x + ',' + Math.max(y, ny);
          const tunnel = (a === -1 && caves.has(bb) && m.tunnels[y * W + x]) || (bb === -1 && caves.has(a) && m.tunnels[ny * W + nx]);
          if (a !== bb && !doors.has(key) && !(caves.has(a) && caves.has(bb)) && !tunnel) continue; seen[ny * W + nx] = 1; q.push([nx, ny]); } }
      return m.rooms.filter(r => !seen[Math.floor(r.ly) * W + Math.floor(r.lx)] && !seen[r.y * W + r.x] ).length;
    };
    const res = { maps: 0, unreachable: 0, worst: 0, lakes: 0, caves: 0, short: 0, bad: [] };
    for (const layout of ['shared', 'halls', 'mixed', 'scattered']) for (const shapes of ['rect', 'some', 'many', 'caves']) for (const rooms of [10, 30]) for (let i = 0; i < 4; i++) {
      const o = layoutOpts(); Object.assign(o, { layout, shapes, rooms, seed: `c-${layout}-${shapes}-${rooms}-${i}`, water: 0.6, river: 'always' });
      const t0 = performance.now(); const m = generate(o); const t = performance.now() - t0; res.worst = Math.max(res.worst, t);
      res.maps++; if (m.river) res.rivers = (res.rivers || 0) + 1; res.cross = (res.cross || 0) + (m.crossings ? m.crossings.length : 0); res.lakes += m.lakes.length; res.caves += m.rooms.filter(r => r.shape.type === 'cave').length;
      if (m.rooms.length < rooms * 0.8) res.short++;
      const u = reach(m); if (u) { res.unreachable += u; if (res.bad.length < 5) res.bad.push(o.seed + ':' + u); }
    }
    return res;
  });
  console.log(JSON.stringify(out));
  console.log(errs.slice(0, 5)); await b.close();
})();
