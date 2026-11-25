// Lists inner walls whose end stops in open floor instead of meeting another wall.
// Run: node dungeon-generator/tests/check-dangling-walls.js   (needs Playwright with Chromium)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html')); await p.waitForTimeout(800);
  const res = await p.evaluate(() => {
    const found = [];
    for (let i = 0; i < 150 && found.length < 40; i++) {
      const o = layoutOpts(); Object.assign(o, { seed: 'dg-' + i, layout: ['shared','mixed','halls','scattered'][i % 4], shapes: ['rect','some','many'][i % 3], rooms: 16 });
      const m = generate(o); const st = lookOpts(); st.title = false;
      const c = document.createElement('canvas'); renderMap(c, m, st, 20);
      const runs = m._runs, open = new Set(m.doors.filter(d => ['arch','bars','open'].includes(d.type)).map(d => d.o + d.x + ',' + d.y));
      for (const r of runs) {
        const [x0, y0, x1, y1] = r, h = y0 === y1;
        for (const [ex, ey, sx, sy] of [[x0, y0, -1, -1], [x1, y1, 1, 1]]) {
          const dx = h ? sx : 0, dy = h ? 0 : sy;
          const px = ex + dx * 0.25, py = ey + dy * 0.25;
          // beyond the end: floor on both sides of the wall line = dangling
          const n1 = h ? [px, Math.round(py) - 0.06] : [Math.round(px) - 0.06, py], n2 = h ? [px, Math.round(py) + 0.06] : [Math.round(px) + 0.06, py];
          if (!(m.floorAt(...n1) && m.floorAt(...n2))) continue;
          const segD = q => { const [a0, b0, a1, b1] = q; const qx = Math.max(Math.min(px, Math.max(a0, a1)), Math.min(a0, a1)), qy = Math.max(Math.min(py, Math.max(b0, b1)), Math.min(b0, b1)); return Math.hypot(px - qx, py - qy); };
          if (runs.some(q => q !== r && segD(q) < 0.45)) continue;
          // next unit edge an open doorway?
          const key = h ? 'h' + Math.floor(px) + ',' + Math.round(y0) : 'v' + Math.round(x0) + ',' + Math.floor(py);
          if (open.has(key)) continue;
          found.push({ seed: o.seed, layout: o.layout, shapes: o.shapes, at: [+px.toFixed(2), +py.toFixed(2)], run: r.slice(0, 4).map(v => +v.toFixed(2)),
            cells: [[Math.floor(n1[0]), Math.floor(n1[1])], [Math.floor(n2[0]), Math.floor(n2[1])]].map(([x, y]) => m.cells[y * m.W + x]) });
        }
      }
    }
    return found;
  });
  console.log(JSON.stringify(res, null, 0));
  await b.close();
})();
