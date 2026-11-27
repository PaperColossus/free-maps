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
- **More symmetric shapes:** capsule (a long hall rounded at both ends), rounded rectangle (corners rounded by 1 or 2 squares), diamond (a square turned 45°, its points cut flat one square wide so doors can sit there; DCSS), quatrefoil (a square core with a half-circle lobe on each side; NetHack's four-leaf clover), keyhole (a round chamber with a three-square neck), and solid-centre rooms (a square or round walk around a block of rock, which is hatched solid; extends the blocked-centre idea). Holes are subtracted from the merged floor outline, so walls wrap them in every style. Quatrefoils and keyholes may get a statue or well as a centrepiece.
- **Hewn rooms:** irregular polygons cut from the footprint, for chambers that look carved rather than drawn with a template. Each corner gets its own cut: angled at an uneven slope, two flatter facets, stepped, or left square. At least three corners are cut, cuts run 1 to 3 squares, and every vertex sits on a half square so the room stays on the grid. Each side keeps at least two squares of straight wall for doors. In symmetric layouts they mirror, and on the axis they're generated symmetric left to right.
- **Cave rooms** grow from a core circle by adding overlapping lumpy circles, each centred on floor that already exists. This follows Brogue's chunky rooms, which accept a new radius-2 circle only where floor already is. Smooth "mouth" lobes touch each side so halls and doors have a straight face to attach to.
- **Lakes** are lumpy blobs with a shallow rim (Brogue's "wreath"). Brogue keeps a lake only if the level stays connected. Here every lake keeps at least a square of dry floor between it and the walls, so it can never cut a room's doors off from each other.
- **Connectivity check:** in the Scattered arrangement, any room the winding halls could not reach is joined to its nearest connected rooms. If its shape offers no reachable doorway, it falls back to a rectangle.
- **Walls centred on the grid:** every wall sits on its grid line. Outer walls are stroked centred on the merged outline of all floor shapes, computed with the MIT-licensed [polygon-clipping](https://github.com/mfogel/polygon-clipping) library from jsDelivr; without it the page falls back to growing the rock mask, which is slower. Inner walls between rooms are stroked on the line between them, and wall ends meet at the line. All walls go onto one layer before styling, so outlined and stone walls have no seams at joints. (An earlier version drew outer walls just outside the floor so one-square halls kept a full square of floor; lining the offsets up at every junction proved fragile, so this was dropped.)
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
- **Looping and mixed paths.** One arc of rooms grows from the entrance; a second arc bows out the other way and then heads back toward the first, and the loop closes as soon as one of its rooms can link straight to a room on the first arc (a door in a shared wall, or a short straight hall). If no room manages that, any already-touching pair across the two arcs is linked; only then is a goal room placed and joined by dug halls. Minor loops are short detours of one or two rooms that rejoin the arc further on. The main loop is gated as before: lock and key, secret door, or two open routes. **Mixed** builds one small loop near the entrance (arcs of up to 3 rooms, at most one minor loop) and grows the rest as branches. On test maps, dug loop halls dropped to about a third of the earlier count.
- **Optional links never wander.** Detours and extra links are skipped when their carved hall would be longer than about twice the gap between the rooms. Carving avoids running alongside an existing hall without joining it.
- **Connectivity repair runs for every arrangement:** any room the entrance can't reach is joined to its nearest connected rooms, or made rectangular and retried.

## Dyson Logos influence (researched)

Sources: his [ENWorld tutorial](https://www.enworld.org/threads/old-fashioned-hand-drawn-maps-with-tutorial.332594/post-6058522), [Beyond Fomalhaut's analysis of The Winter Tombs](https://beyondfomalhaut.blogspot.com/2020/05/blog-anatomy-of-dungeon-map.html), and his [map copyright page](https://dysonlogos.blog/about/copyright/). His licence covers his maps, not his style; we borrow conventions only, copy no map, and don't use his name in the tool.

Built:
- **Ink & graph preset:** heavy ink walls (his second, thickening pass), pen hatching (short groups of strokes, each slightly shortened and off-angle, neighbours at contrasting angles), blue graph-paper grid, bare white paper beyond the hatching, no shadows, and grit (dots and small stones) on cave floors.
- **Entrances:** one to three ("a good dungeon has at LEAST two entrances"). Extra entrances are a passage from an outer room straight off the map edge (a cave mouth for caves), kept apart and on different sides, or else a stair up in a room far from the first entrance.

- **Rivers (Winter Tombs' barriers):** a meandering band of water across the whole map, through rooms, halls and rock (a hatched channel), flowing off both edges. Crossings go only where they join parts the river has cut off, so the river works as a barrier: a bridge in built rooms and halls, a ford of stepping stones in caves and tunnels. Every dry part of every room must stay reachable or the river is tried elsewhere (up to 14 times, so "Always" occasionally gives none). In symmetric maps the meander and its crossings are mirrored. Doors that would open straight into the water are removed, and room numbers and furnishings keep to dry floor.

- **Elevation within a level:** raised daises against a doorless, nicheless wall of built rooms (one or two squares deep, half the wall wide, with step lines along the front), or filling the curved end of an apse; ledges across larger caves (a firm line with tick marks on the low side and a flight of carved steps through it); and short flights of steps partway along straight halls, with an arrow pointing down. None change where you can walk. They stay clear of stairs, furnishings, water and room numbers, and are mirrored in symmetric maps. The Elevation setting (None, Some, Lots) defaults to Some.

Not built: passages that run over or under each other (needs layout support for crossing halls that don't connect), and a side-view inset.
