# Dungeon Sketcher checks

These scripts load `../index.html` in headless Chromium through Playwright and generate many maps. Run them from the repository root after changing the generator or the wall drawing.

| Script | What it checks | Expect |
| --- | --- | --- |
| `node dungeon-generator/tests/check-layouts.js` | Every symmetry, paths, arrangement and shape combination. It checks that every room can be reached from the entrance, that the room count is met and how symmetric the floor is, and it times each map. | `unreach` and `short` are 0 |
| `node dungeon-generator/tests/check-wall-alignment.js [maps]` | Inner wall ends that don't line up with the wall they run straight into on the same grid line (another inner wall or a room's outer wall). Across an open doorway the two sides always share one side of the line, so the check doesn't need to compare across one. | A handful out of about 2,000 ends. Short slivers where a curve meets a doorway are tucked in on purpose and count here. |
| `node dungeon-generator/tests/check-dangling-walls.js` | Inner walls that stop in open floor instead of meeting another wall. | 0 or 1 (a straight wall ending against a curve that wraps past it is a known false positive) |
