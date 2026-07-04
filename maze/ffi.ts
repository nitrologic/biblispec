// ffi.ts

// Load the Windows user32 library using Deno FFI

const user32 = Deno.dlopen("user32.dll", {
    GetAsyncKeyState: {parameters: ["i32"],result: "i16"},
    GetCursorPos: {parameters: ["buffer"],result: "i32"},
});

const VK_LEFT = 0x25;
const VK_UP = 0x26;
const VK_RIGHT = 0x27;
const VK_DOWN = 0x28;

export function pollKeys():number{
    const up = user32.symbols.GetAsyncKeyState(VK_UP)&0x8000;
    const down = user32.symbols.GetAsyncKeyState(VK_DOWN)&0x8000;
    const left = user32.symbols.GetAsyncKeyState(VK_LEFT)&0x8000;
    const right = user32.symbols.GetAsyncKeyState(VK_RIGHT)&0x8000;
    const space = user32.symbols.GetAsyncKeyState(32)&0x8000;
    const escape = user32.symbols.GetAsyncKeyState(27)&0x8000;
    return (up?1:0)|(down?2:0)|(left?4:0)|(right?8:0)|(space?16:0)|(escape?32:0);
}

// buttons: 1 = Left, 2 = Right, 4 = Middle

export interface MouseStatus {x: number;y: number; buttons: number;}

const mouseBuffer = new Int32Array(2);

export function pollMouse(): MouseStatus {
    user32.symbols.GetCursorPos(mouseBuffer);
    const left=user32.symbols.GetAsyncKeyState(VK_LBUTTON) & 0x8000;
    const right=user32.symbols.GetAsyncKeyState(VK_RBUTTON) & 0x8000;
    const middle=user32.symbols.GetAsyncKeyState(VK_MBUTTON) & 0x8000;
    const buttons=(leftClick?1:0)|(rightClick?2:0)|(middleClick?4:0);
    return {x:mouseBuffer[0],y:mouseBuffer[1],buttons};
}