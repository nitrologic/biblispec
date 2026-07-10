# ATARI Digital Vector Generator

## Display logic

1. CPU writes to `$3000` (DMA Go) → starts DVG.
2. DVG reads from current bank (`$4000` or `$4400`, selected via `$4001` bit 1).
3. DVG executes opcode stream starting at bank base:
   - LABS → set absolute position + scale
   - VCTR / SVEC → draw vector (line) with brightness
   - JSRL → call subroutine (shape in ROM/RAM)
   - RTSL → return from subroutine
   - HALT → stop drawing, raise "done" signal
4. While running: `$2002` bit 7 = 1 (busy)
5. On HALT: clear bit 7 → CPU can prepare next frame
6. CPU flips bank for next frame (double buffering)

## DVG Opcodes

| High Nibble | Name   | Bytes | Description |
|-------------|--------|-------|-------------|
| `$A0-AF`    | LABS   | 3     | Load Absolute (X, Y, Scale) |
| `$B0`       | HALT   | 1     | Stop drawing, signal done |
| `$C0-CF`    | JSRL   | 2     | Jump Subroutine (to shape) |
| `$D0`       | RTSL   | 1     | Return from Subroutine |
| `$E0-EF`    | JMPL   | 2     | Jump (rare) |
| `$F0-FF`    | SVEC   | 2     | Short Vector (common) |
| Other       | VCTR   | 3-4   | Long Vector |

**Most used:** SVEC, LABS, JSRL/RTSL, HALT.

## SVEC Opcode

**Most common opcode** in Asteroids.

- **2 bytes**
- Format: `byte1 byte2`

**byte1**: `SSSS YYYs`  
- `SSSS` = Scale (0-15)  
- `YYYs` = Y delta (3-bit signed magnitude + sign)

**byte2**: `XXXX BBBB`  
- `XXXX` = X delta (4-bit signed magnitude)  
- `BBBB` = Brightness (0-15)

**Notes**:
- Very compact for small lines.
- Used heavily for ship, asteroids, explosions, text.
- Scale is relative to current global scale from LABS.

## Hardware Interface

The 6502 communicates with the Vector Generator through these main points:

Vector RAM ($4000 - $47FF, 2KB)
DMA Go ($3000) — Writing anything here starts the beam drawing.
Halt Status ($2002) — Bit 7 = 1 while busy, 0 when finished.
Double buffering — The game flips between $4000 and $4400 ranges.

The DVG reads a stream of opcodes from Vector RAM and draws lines/points until it hits a HALT.

```
LabsOpcode      .eq     $a0    {const}          ;LABS vector state machine opcode.
HaltOpcode      .eq     $b0    {const}          ;HALT vector state machine opcode.
JsrlOpcode      .eq     $c0    {const}          ;JSRL vector state machine opcode.
RtslOpcode      .eq     $d0    {const}          ;RTSL vector state machine opcode.
JmplOpcode      .eq     $e0    {const}          ;JMPL vector state machine opcode.
SvecOpcode      .eq     $f0    {const}          ;SVEC vector state machine opcode.
ZeroPageRam     .eq     $00    {addr/256}       ;Through $00FF.
VecRamPtr       .eq     $02    {addr/2}         ;Pointer to current vector RAM location.
```
