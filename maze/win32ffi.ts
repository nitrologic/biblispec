// win32ffi.ts

// link windows user32.dll GetAsyncKeyState GetCursorPos

const user32 = Deno.dlopen("user32.dll", {
	GetAsyncKeyState: {parameters: ["i32"],result: "i16"},
	GetCursorPos: {parameters: ["buffer"],result: "i32"},
});

// keyboard keys

const VK_LBUTTON=1;
const VK_RBUTTON=2;
const VK_MBUTTON=4;
const VK_LEFT = 0x25;
const VK_UP = 0x26;
const VK_RIGHT = 0x27;
const VK_DOWN = 0x28;
const VK_SPACE=32;
const VK_BACK=8;
const VK_ESCAPE=27;

const keyCodes=[
	VK_UP,VK_DOWN,VK_LEFT,VK_RIGHT,VK_SPACE,VK_BACK,VK_ESCAPE
]

export function pollKeyboard():number{
	let bits=0;
	for(let i=0;i<keyCodes.length;i++){
		if(user32.symbols.GetAsyncKeyState(keyCodes[i])&0x8000) bits|=1<<i;
	}
	return bits;
}

// mouse buttons: 1 = Left, 2 = Right, 4 = Middle

export interface MouseStatus {x: number;y: number; buttons: number;}

const mouseBuffer = new Int32Array(2);

export function pollMouse(): MouseStatus {
	user32.symbols.GetCursorPos(mouseBuffer);
	const left=user32.symbols.GetAsyncKeyState(VK_LBUTTON) & 0x8000;
	const right=user32.symbols.GetAsyncKeyState(VK_RBUTTON) & 0x8000;
	const middle=user32.symbols.GetAsyncKeyState(VK_MBUTTON) & 0x8000;
	const buttons=(left?1:0)|(right?2:0)|(middle?4:0);
	return {x:mouseBuffer[0],y:mouseBuffer[1],buttons};
}

export interface MidiMessage { status: number; data1: number; data2: number; millis: number }

const winmm = Deno.dlopen("winmm.dll", {
	midiInGetNumDevs: { parameters: [], result: "u32" },
	midiInOpen: { parameters: ["buffer", "u32", "pointer", "pointer", "u32"], result: "u32", callback: true },
	midiInStart: { parameters: ["pointer"], result: "u32" },
	midiInStop: { parameters: ["pointer"], result: "u32" },
	midiInClose: { parameters: ["pointer"], result: "u32" },
	midiOutGetNumDevs: { parameters: [], result: "u32" },
	midiOutOpen: { parameters: ["buffer", "u32", "u32", "u32", "u32"], result: "u32" },
	midiOutShortMsg: { parameters: ["pointer", "u32"], result: "u32" },	
	midiOutClose: { parameters: ["pointer"], result: "u32" }
});

const CALLBACK_FUNCTION = 0x00030000; // Flag telling Windows we are passing a function pointer
const MIM_DATA = 0x3C3;              // Window message for received short MIDI data

let midiOut: Deno.PointerValue = null;
let midiIn: Deno.PointerValue = null;
let midiMessageQueue: MidiMessage[] = [];

const midiCallback = Deno.UnsafeCallback.threadSafe(
	{
		parameters: ["pointer", "u32", "pointer", "u32", "u32"],
		result: "void",
	},
	(_hMidiIn, msg, _dwInstance, _dwParam1, _dwParam2) => {
		if (msg === MIM_DATA) {
			const i32=_dwParam1|0;
			const millis=_dwParam2|0;
			midiMessageQueue.push({ status:i32&0xff,data1:(i32>>8)&0xff,data2:(i32>>16)&0xff,millis });
		}
	}
);

export function initMidi(inputId:number=0,outputId:number=0): boolean {
	if (winmm.symbols.midiInGetNumDevs() === 0) return false;
	const handleBuffer = new BigUint64Array(1);

	const result1 = winmm.symbols.midiInOpen(handleBuffer,inputId|0,midiCallback.pointer,null,CALLBACK_FUNCTION);
	if (result1 !== 0) return false;
	midiIn = Deno.UnsafePointer.create(handleBuffer[0]);

	const result2 = winmm.symbols.midiOutOpen(handleBuffer,outputId|0,0,0,0);
	if (result2 !== 0) return false;
	midiOut = Deno.UnsafePointer.create(handleBuffer[0]);

	return winmm.symbols.midiInStart(midiIn) === 0;
}

export function closeMidi() {
	midiCallback.close();
	if(midiOut){
		winmm.symbols.midiOutClose(midiOut);
		midiOut = null;
	}
	if (!midiIn) return;
	winmm.symbols.midiInStop(midiIn);
	winmm.symbols.midiInClose(midiIn);
	midiIn = null;
}

export function pollMidi(): MidiMessage[] {
	if (midiMessageQueue.length === 0) return [];
	const messages = [...midiMessageQueue];
	midiMessageQueue = [];
	return messages;
}

export function writeMidi(data0:number,data1:number,data2:number):void{
	if(midiOut){
		const packed = data0 | (data1 << 8) | (data2 << 16);
   		winmm.symbols.midiOutShortMsg(midiOut, packed);	
	}
}