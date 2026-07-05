// macosffi.ts

const kCGEventSourceStateCombinedSessionState = 0;

// CGKeyCode values
const kVK_LeftArrow  = 0x7b;
const kVK_RightArrow = 0x7c;
const kVK_UpArrow    = 0x7e;
const kVK_DownArrow  = 0x7d;
const kVK_Space      = 0x31;
const kVK_Escape     = 0x35;

const appServices = Deno.dlopen(
  "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices",
  {
    CGEventSourceKeyState: {
      parameters: ["i32", "u16"],
      result: "i32",
    },
  },
);

export function pollKeyboard(): number {
  const up    = appServices.symbols.CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState, kVK_UpArrow)    !== 0;
  const down  = appServices.symbols.CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState, kVK_DownArrow)  !== 0;
  const left  = appServices.symbols.CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState, kVK_LeftArrow)  !== 0;
  const right = appServices.symbols.CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState, kVK_RightArrow) !== 0;
  const space = appServices.symbols.CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState, kVK_Space)      !== 0;
  const esc   = appServices.symbols.CGEventSourceKeyState(kCGEventSourceStateCombinedSessionState, kVK_Escape)     !== 0;

  return (up    ? 1  : 0) |
         (down  ? 2  : 0) |
         (left  ? 4  : 0) |
         (right ? 8  : 0) |
         (space ? 16 : 0) |
         (esc   ? 32 : 0);
}

export function pollMouse() {
  return { x: 0, y: 0, buttons: 0 };
}

export function initMidi() {
  return false;
}

export function pollMidi() {
  return [];
}

export function closeMidi() {

}