# nitrologic table

 ## API Reference

BitGrid features:

* cellular automata
* heatmaps
* border rendering
* maze generators

### BitGrid(width: number, height: number, layers: number)

Contains a compact binary grid (bitmap) stored in `Uint32Array` layers.

Creates a new `BitGrid` of given dimensions and number of independent layers.

* `width`, `height` – pixel dimensions 
* `layers` – number of parallel bit planes

### setPixel(x: number, y: number, layer: number, state: boolean): void

Sets the pixel at `(x,y)` in `layer` to `true` or `false`. No wrapping.

### rect(x: number, y: number, width: number, height: number, layer: number = 0): void

Fills a solid rectangle of pixels with `true` on the given `layer`. `x,y` are top‑left corner.

### getPixel(x: number, y: number, layer: number): boolean

Returns the value (true/false) of pixel at `(x,y)` in `layer`. Coordinates are wrapped toroidally.

### countNeighbors(x: number, y: number, layer: number): number

Returns the count (0–8) of live cells in the 3×3 Moore neighborhood of `(x,y)` on `layer`. Toroidal wrapping.

### getNeighbors(x: number, y: number, z: number): number

Returns an 8‑bit mask representing the 3×3 neighborhood (excluding center) of cell `(x,y,z)`.
Bit order (from MSB to LSB): topleft, top, topright, left, right, bottomleft, bottom, bottomright.

### writePixels(pixels: boolean[], x: number, y: number, layer: number): void

Writes a single row of pixel states (array of booleans) starting at `(x,y)` on `layer`. 

Efficiently handles bit‑packed writes.

### cool(falloff: number): void

Multiplies every value in the internal heatmap by `falloff` (0–1 range for decay). 

Used to gradually reduce heatmap values.

### heat(layer: number, value: number): void

Adds `value` to the heatmap at every cell location where the bit in `layer` is `true`.

### drawMask(strings: string[], maskChar: string, x: number, y: number, layer: number): void

Writes a text mask onto the grid. 

Each string in `strings` is a row; characters equal to `maskChar` set the bit `true`, others `false`. 

Starts at position `(x,y)`.

### drawGrid(skipx: number = 20, skipy: number = 10, layer: number = 0): void

Draws a regular grid of vertical and horizontal lines (thickness 1) on `layer`. 

`skipx`, `skipy` – spacing between lines. 

The pattern is centering with extra lines on edges.

### stepConwayLife(readLayer: number, writeLayer: number): number

Performs one generation of Conway’s Game of Life: reads from `readLayer`, writes result to `writeLayer`. 

Returns the number of cells that changed (entropy). 

Uses toroidal topology.

### copyLayer(readLayer: number, writeLayer: number): void

Copies all pixel data from one layer to another (same dimensions).

### static fromLines(lines: string[], truth: string): BitGrid

Parses an array of strings (e.g., a maze) and returns a 2‑layer `BitGrid` (double size with padding).
`lines` – each string represents a row; `#` characters are truth pixels.
`truth` – the character that marks a filled cell.

Returns a grid of width `lines[0].length * 2 + 5`, height `lines.length * 2 + 5`, with truth pixels placed at `(3 + x*2, 3 + y*2)` on layer 0.



## Maze Algorithms

|  Algorithm             |  Speed     |  Bias / Style                      |  Complexity          |
|------------------------|------------|------------------------------------|---------------------:|
|  Recursive Backtracker |  Fast      |  Long corridors, “river” pattern   |  Very easy           |
|  Kruskal               |  Fast      |  Balanced, uniform randomness      |  Medium (union‑find) |
|  Prim                  |  Fast      |  Short dead ends, tree‑like        |  Medium              |
|  Aldous‑Broder         |  Slow      |  Uniform perfect maze              |  Very easy           |
|  Wilson                |  Medium    |  Uniform perfect maze              |  Medium              |
|  Eller                 |  Fast      |  Row‑by‑row, memory efficient      |  Medium‑hard         |
|  Binary Tree           |  Fastest   |  Highly biased, diagonal           |  Trivial             |
|  Sidewinder            |  Fast      |  Moderately biased                 |  Easy                |

