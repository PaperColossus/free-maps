// Counts inner wall ends that are not in line with the next wall on the same grid line (should be close to 0).
// Run: node dungeon-generator/tests/check-wall-alignment.js   (needs Playwright with Chromium)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html')); await p.waitForTimeout(800);
  const res = await p.evaluate((N) => {
    const out = { maps: 0, ends: 0, bad: 0, examples: [] };
    const layouts = ['shared', 'mixed', 'halls', 'scattered'], shapes = ['rect', 'some', 'many', 'caves'];
    for (let i = 0; i < N; i++) {
      const o = layoutOpts(); Object.assign(o, { seed: 'al-' + i, layout: layouts[i % 4], shapes: shapes[(i >> 2) % 4], rooms: 16, niches: 0.4 });
      const m = generate(o); const st = lookOpts(); st.title = false;
      renderMap(document.createElement('canvas'), m, st, 20);
      out.maps++;
      const hs = m._halfSq, F = m._exactFloor, runs = m._runs;
      const base = r => { const h = r[1] === r[3]; const off = h ? r[1] : r[0]; return Math.round(off); };
      for (const r of runs) {
        if (r[5] === 'jog') continue;
        const h = r[1] === r[3], off = h ? r[1] : r[0], pos = base(r), lo = h ? r[0] : r[1], hi = h ? r[2] : r[3];
        for (const [end, sgn] of [[lo, -1], [hi, 1]]) {
          out.ends++;
          let found = null;
          for (let t = end + sgn * 0.06; Math.abs(t - end) < 1.6; t += sgn / 16) {
            const other = runs.find(q => q !== r && (q[1] === q[3]) === h && base(q) === pos && (h ? q[0] - 0.01 <= t && t <= q[2] + 0.01 : q[1] - 0.01 <= t && t <= q[3] + 0.01));
            if (other) { if (Math.abs(t - end) > 0.3) break; /* across an open doorway the two sides may differ */ found = { kind: 'inner', off: h ? other[1] : other[0] }; break; }
            const P = h ? F(t, pos - 0.06) : F(pos - 0.06, t), Q = h ? F(t, pos + 0.06) : F(pos + 0.06, t);
            if (P !== Q) { if (Math.abs(t - end) > 0.3) break; /* across an open doorway */ found = { kind: 'outer', off: pos + (P ? 1 : -1) * hs }; break; }
            if (!P && !Q) break; // solid rock: wall turns away
            // both floor: a doorway or open floor; keep looking only a short way
          }
          if (found && Math.abs(found.off - off) > 0.02) {
            out.bad++;
            if (out.examples.length < 12) out.examples.push({ seed: o.seed, layout: o.layout, shapes: o.shapes, at: h ? [+end.toFixed(2), pos] : [pos, +end.toFixed(2)], o: h ? 'h' : 'v', kind: found.kind, off: +off.toFixed(3), other: +found.off.toFixed(3) });
          }
        }
      }
    }
    return out;
  }, +(process.argv[2] || 64));
  console.log(res.maps, 'maps', res.ends, 'wall ends', res.bad, 'misaligned');
  for (const e of res.examples) console.log(JSON.stringify(e));
  await b.close();
})();
