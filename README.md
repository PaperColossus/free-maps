# Paper Colossus Free Maps

Free battle maps from [Paper Colossus](https://papercolossus.com), made with [Tabletop Canvas](https://papercolossus.com/pages/tabletop-canvas).

Download them from the [Releases](https://github.com/PaperColossus/free-maps/releases) page.

## Maps

| Map | Size | Levels |
| --- | --- | --- |
| [Hedge Witch's Cabin](https://github.com/PaperColossus/free-maps/releases/tag/hedge-witchs-cabin) | 15 × 15 squares, 140 px per square, 300 DPI, gridless | Ground, Basement (day and night) |

## Dungeon Sketcher (experimental)

[`dungeon-generator/index.html`](dungeon-generator/index.html) is a browser-based dungeon map generator. Open the file in a browser; it needs no build step or server. It loads the MIT-licensed polygon-clipping library from jsDelivr and still works, more slowly, without it.

- **Layout:** seed, number of rooms, symmetry (asymmetric, partly symmetric, symmetric), paths (branching, mixed, or looping, where loops close through shared walls or short halls and the main loop may be gated by a locked door and key or a secret door), room size range, room shapes (circles with optional pools, half circles and apses, capsules, rounded rectangles, octagons, hexagons, diamonds, quatrefoils, keyholes, rooms around a solid centre, crosses, T and L shapes, caves), niches, water, extra loops, and door mix. Choose how rooms connect: rooms that share walls, rooms joined by halls, a mix of both, or scattered rooms with winding halls. Hall length and shape are adjustable.
- **Look:** wall style (solid ink, sketchy, outlined, stone blocks, fine line), floor (plain, flagstones, planks, checker, cobbles), grid (lines, dots, none), surroundings (hatching, cross-hatch, stipple, solid rock, bare) and palette. Walls are centred on the grid. Shadows can be cast from a chosen light direction. Changing the look never changes the layout.
- **Export:** PNG at 70 to 200 px per square.

The hatching technique (Poisson-disc points, Voronoi cells, a cluster of parallel strokes per cell) follows Watabou's approach for One Page Dungeon, as described by [Red Blob Games](https://www.redblobgames.com/x/1947-dyson-hatching/). The code here is a separate implementation. Room-shape ideas drawn from Brogue CE, Dungeon Crawl Stone Soup and NetHack are listed in [`dungeon-generator/DESIGN-NOTES.md`](dungeon-generator/DESIGN-NOTES.md).

## Terms of Use

- Free for non-commercial use: run them in your own games, at home or online.
- Don't sell, resell or redistribute the files. Link people to this page or [papercolossus.com](https://papercolossus.com/pages/tabletop-canvas) instead.
- Don't use the maps in anything you sell or charge for.

## Map Assets

These maps use art assets by Saki / [DnDungeon](https://dndungeon.com), used under the [DnDungeon Assets License](https://dndungeon.com/pages/dndungeon-assets-license) for their Core asset pack. Paper Colossus is not affiliated with or endorsed by DnDungeon.

© 2026 Paper Colossus, LLC.
