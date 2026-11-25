# Dungeon Sketcher design notes

Before adding a new shape or generation feature, check how established open-source generators handle it. This file records what was looked at, what was adopted, and the license status. Everything here is a separate implementation of the ideas; no third-party code is copied.

## Sources

| Source | License | What it covers |
| --- | --- | --- |
| [Red Blob Games, "Dyson hatching"](https://www.redblobgames.com/x/1947-dyson-hatching/), after [Watabou's One Page Dungeon](https://watabou.itch.io/one-page-dungeon) | Apache 2.0 (Red Blob code) | Hatching: Poisson-disc points, Voronoi cells, a cluster of parallel strokes per cell |
| [Brogue CE `Architect.c`](https://github.com/tmewett/BrogueCE/blob/release/src/brogue/Architect.c) | AGPL-3.0 | Room designs (cross, symmetrical cross, small, circular, chunky, cavern), door sites, hall attachment, loops |
| [Dungeon Crawl Stone Soup `geoelf_rooms.lua`](https://github.com/crawl/crawl/blob/master/crawl-ref/source/dat/dlua/layout/geoelf_rooms.lua) | GPL (DCSS project) | Square, diamond, cross, triangle, hexagon and octagon rooms; per-shape exit directions; symmetric decorations |
| [NetHack themed rooms](https://nethackwiki.com/wiki/Themed_room) | NetHack General Public License | L, T, S, cross, circular and four-leaf rooms; blocked centres; rooms within rooms |

## Adopted

- **Cross, T and offset-cross rooms** are two overlapping bars, a full-width one and a full-height one. Centred bars make a cross; a bar at an edge makes a T. (Brogue's cross rooms, NetHack's T and cross.)
- **Near-regular octagons** cut each corner back about 0.29 of the shorter side. DCSS cuts at |x| + |y| ≤ 1.4r.
- **Hexagons** take exits only on their flat sides. DCSS restricts each shape to its own exit directions; here `doorOK` enforces it by checking that the wall is straight across most of the square.
- **Blocked centre:** large rotundas sometimes get a sunken pool, with the column ring moved outward and the room number moved above the pool. (Brogue's circular rooms with a hole, NetHack's "blocked center".)
- **Loops by walking distance:** extra links only go between rooms that are three or more rooms apart along existing links. Brogue's `addLoops` only opens a wall where the path distance between its two sides exceeds a threshold.
- **Cave rooms** grow from a core circle by adding overlapping lumpy circles, each centred on floor that already exists. This follows Brogue's chunky rooms, which accept a new radius-2 circle only where floor already is. Smooth "mouth" lobes touch each side so halls and doors have a straight face to attach to.
- **Lakes** are lumpy blobs with a shallow rim (Brogue's "wreath"). Brogue keeps a lake only if the level stays connected. Here every lake keeps at least a square of dry floor between it and the walls, so it can never cut a room's doors off from each other.
- **Connectivity check:** in the Scattered arrangement, any room the winding halls could not reach is joined to its nearest connected rooms. If its shape offers no reachable doorway, it falls back to a rectangle.
- **Walls as one shape:** every wall (the band outside the floor and the inner walls) is drawn onto one layer, so outlined and stone styles outline the combined shape with no seams at joints. Inner walls are built as chains along each grid line, and each chain takes one side offset, set by where the outer walls continue past its ends, so a wall never steps in and out. On each square, a wall covers exactly the stretch where both sides are floor, so curved and cut-corner rooms get walls along partial squares. A wall ending against a curve runs on until the curve has pulled a wall's thickness away from the line, measured against the exact room outlines. Rooms meeting corner to corner get one wall that turns a single corner. Where an inner wall ends against another inner wall (a T or a corner), it stops exactly at that wall's far face, so joints close up whichever side of the grid line each wall sits on. A straightening pass then aligns walls that continue each other along a line (end to end, across a doorway, or into an outer wall): inner walls take the side their neighbours agree on, the two sides of a doorway always line up, an end that runs into an outer wall on the other side turns the corner, and wall ends at a doorway stop at the opening's edge. Checks for this are in `tests/`.
- **Niche patterns:** about half the rooms that get niches use a pattern: niches symmetric about the centre of one wall, spread evenly with the end gaps about half the middle gaps (1, 2, 1 squares on a six-square wall), or the same pattern repeated on the facing wall. The rest place niches freely.
- **Natural connections:** caves never get built doors between them. Caves that touch merge without a wall, and a hall between two caves is drawn as a rough tunnel. A hall or built room meeting a cave usually gets a plain opening (75% for halls, 50% for rooms), otherwise a door.
- **Door sites** have to be on a straight face. Brogue accepts a door site only when exactly one direction faces into the room, which rules out corners.

## Not yet adopted, worth trying

- **Cellular-automaton caverns:** Brogue's other cave method, for large open caverns.
- **Diamond and triangle rooms** from DCSS, which exit at corners or along flanks.
- **Symmetric decoration sets** from DCSS: rings of 8 pillars, centre features, glass partitions with doors.
- **Rooms within rooms:** NetHack's mausoleum and nesting rooms.
- **Lakes that touch walls, with bridges** placed only where they save a long walk. This needs a connectivity check like Brogue's (`lakeDisruptsPassability`).

## Layout structure: symmetry and loops

| Source | What it says |
| --- | --- |
| [Watabou, One Page Dungeon comments](https://watabou.itch.io/one-page-dungeon/comments?after=236) | Rooms grow recursively. An expanded room usually gets identical wings left and right of its entrance, one child opposite the entrance, or both. Children are occasionally made asymmetric because "perfect symmetry doesn't look good". The result is still a tree, so loops are added afterwards by joining adjacent rooms and adding tunnels. The goal is local symmetry that makes a dungeon look planned. |
| [Boris the Brave, "Dungeon generation in Unexplored"](https://www.boristhebrave.com/2021/04/10/dungeon-generation-in-unexplored/) | Cyclic generation: start with a start, a goal and a big loop between them. The two arcs become two routes, and the cycle type decides how they are used (alternative routes, lock and key, hidden shortcut, hub). Minor cycles add short detours, then dead ends are added. |
| [Boris the Brave, "Lock and key dungeons"](https://www.boristhebrave.com/2021/02/27/lock-and-key-dungeons) | Locks and keys can be anything that blocks or enables progress. Gating one arc of a loop turns a redundant loop into a meaningful choice. |
| [The Alexandrian, "Xandering the dungeon"](https://thealexandrian.net/wordpress/13103/roleplaying-games/xandering-the-dungeon-part-2-xandering-techniques) | Branches still play linearly; loops are what make a dungeon non-linear. Too many loops make choices meaningless. |

Built:

- **Symmetry** (Asymmetric / Partly symmetric / Symmetric). There is a centre axis. Spine rooms sit on it with shapes made symmetric about their own centre line. Wing rooms come in mirrored pairs, with mirrored shapes, halls and door types; the right-hand room is grown and its reflection added. Extra links, carved halls, niches, furnishings and lakes are mirrored too. Partly symmetric breaks about 30% of pairs (one side only, or a different room on the other side) and occasionally adds a lone room. On test maps, floor symmetry is about 0.98 for Symmetric, 0.87 to 0.95 for Partly symmetric and about 0.5 for Asymmetric.
- **Looping paths.** Two arcs of rooms grow from the entrance toward waypoints that bow out on either side of a line to a goal room. The arc ends are joined to the goal by carved halls. One or two minor cycles add a detour room off an arc, joined back to the next room on it, and the remaining rooms grow as branches. The main cycle is then gated: lock and key (50%: a locked door on one arc, the key in a room on the other), a secret door (25%), or two open routes (25%). The Scattered arrangement builds its main cycle as a ring through its outer rooms.
- **Optional links never wander.** Detours and extra links are skipped when their carved hall would be longer than about twice the gap between the rooms. Carving avoids running alongside an existing hall without joining it.
- **Connectivity repair runs for every arrangement:** any room the entrance can't reach is joined to its nearest connected rooms, or made rectangular and retried.
