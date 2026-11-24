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
- **Door sites** have to be on a straight face. Brogue accepts a door site only when exactly one direction faces into the room, which rules out corners.

## Not yet adopted, worth trying

- **Cellular-automaton caverns:** Brogue's other cave method, for large open caverns.
- **Diamond and triangle rooms** from DCSS, which exit at corners or along flanks.
- **Symmetric decoration sets** from DCSS: rings of 8 pillars, centre features, glass partitions with doors.
- **Rooms within rooms:** NetHack's mausoleum and nesting rooms.
- **Lakes that touch walls, with bridges** placed only where they save a long walk. This needs a connectivity check like Brogue's (`lakeDisruptsPassability`).
