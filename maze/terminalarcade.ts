// terminalarcade.ts
// (c) 2026 nitrologic

// export function list

// writeConsole 
// replaceText 
// setCursor
// sleep 
// pollKeypad
// runTerminal pollTerminal stopTerminal 

// axis pumps

const UPDOWN=0;
const LEFTRIGHT=1;

const UpBit=1;
const DownBit=2;
const LeftBit=4;
const RightBit=8;

const HomeBit=16;
const EndBit=32;
const DeleteBit=64;
const InsertBit=128;

const PageUpBit=256;
const PageDownBit=512;
const QuitBit=1024;

// mouse bits << 16

const LeftMouseBit=1;
const RightMouseBit=2;
const MouseMotionBit=4;

const pump:number[]=[0,0];

function fadePumps():number[]{
	const previous = [...pump];
	for(let index=0;index<pump.length;index++){
		let integral:number=pump[index]|0;
		let fade=(integral>>3);
		integral=(fade)?integral-fade:0;
		pump[index]=integral;
	}
	return previous;
}

function updatePumps(keys:number){
	if(keys&UpBit) pump[UPDOWN]-=100;
	if(keys&DownBit) pump[UPDOWN]+=100;
	if(keys&LeftBit) pump[LEFTRIGHT]-=72;
	if(keys&RightBit) pump[LEFTRIGHT]+=72;
	fadePumps();
}

// writeConsole text

const encoder=new TextEncoder();

export function writeConsole(text:string){
	Deno.stdout.write(encoder.encode(text));
}

// replaceText text, search, replace, clockwise

export function replaceText(text: string, search: string, replace: string, leftToRight:boolean=true) : string {
	if (leftToRight) return text.replaceAll(search, replace);
	const reversed = Array.from(text).reverse().join("");
	const revSearch = Array.from(search).reverse().join("");
	const revReplace = Array.from(replace).reverse().join("");
	const res = reversed.replaceAll(revSearch, revReplace);
	return Array.from(res).reverse().join("");
}

// setCursor x,y

const resetConsole="\x1b[0m";
const enableCursor="\x1b[?25h";
const disableCursor="\x1b[?25l";

let blinkFrame=0;
let mouseX=0;
let mouseY=0;

export function setCursor(col: number,row: number): string {
	let code=`\x1b[${row};${col}H`;
	const blink=((blinkFrame++)&16)==0;
	code+=blink?enableCursor:disableCursor;
	return code;
}

// sleep ms

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// keypad

const keyboardBuffer = new Uint8Array(2048);
let keyboardQueue:Uint8Array[]=[];

const QToQuit=false;
let running=false;
let stopped=false;

export function isRunning(){
	return running;
}

export function stopRunning(){
	running=false;
}

let inputTask=null;

export async function runTerminal(withMouse:boolean){
	if(!running){
		running=true;
		Deno.stdin.setRaw(true);
		inputTask=runInputTask(withMouse);
		await sleep(20)
	}
}

export function stopTerminal() {
	if(!stopped){
		Deno.stdout.writeSync(encoder.encode("\x1b[?1003l\x1b[?1006l\x1b[?25h"));	
		console.log(resetConsole);
		console.log("[SYSTEM] endInput");
		Deno.stdin.close();
		stopped=true;
	}
}

async function runInputTask(enableMouse:boolean=false) {
	if(enableMouse){
		Deno.stdout.writeSync(encoder.encode("\x1b[?1003h\x1b[?1006h\x1b[?25l"));	
		console.log("mouseOn");
	}
	while (running) {
		try{
			const bytes = await Deno.stdin.read(keyboardBuffer); 
			if (bytes && QToQuit && keyboardBuffer[0] === 113) { // 113 = 'q'
				running = false;
				break;
			}
			if(bytes){
				const payload=keyboardBuffer.slice(0,bytes);
				keyboardQueue.push(payload);
			}
		}catch(e){ // operation canceled code EINTR
			if(e.code!="EINTR"){
				console.log("[E]",e);
			}
			running=false;
		}
	}
	if(enableMouse){
		Deno.stdout.writeSync(encoder.encode("\x1b[?1003l\x1b[?1006l\x1b[?25h"));	
		console.log("mouseOff");
	}
}

export function pollTerminal():Uint8Array[]{
	const queue=keyboardQueue;
	keyboardQueue=[];
	return queue;
}

export function pollTerminalKeys(): number {
	const queue=pollInputs();
	if(queue){
		for(const event of queue){
//			if (event[0]==27)
			console.log("[KB]",event);
		}
	}
	return 0;
}

export interface KeypadState {hitBits:number; axisX:number, axisY:number, mouseX:number, mouseY:number}

const decoder = new TextDecoder();
let keyPad=0;
let mouseButtons=0;

export function pollKeypad():KeypadState{
	let queue:Uint8Array[]=pollTerminal();
	for(let index=0;index<queue.length;index++){
		let keys=queue[index];
		const rawKey=keys[0];
		switch(rawKey){
			case 27:
				if(keys.length>1){
					const sequence=decoder.decode(keys.subarray(1));
					if(sequence.startsWith("[<")){
						//35;53;11M")
						const m3=sequence.substring(2).split(";");
						const b=parseInt(m3[0]);
						mouseX=parseInt(m3[1]);
						mouseY=parseInt(m3[2]);
						switch(b){
							case 0:mouseButtons^=1;break;
							case 32:mouseButtons^=2;break;
							case 35:mouseButtons|=4;break;//console.log("[M]",{b,x,y});
						}
						continue;						
					}
					switch(sequence){
						case "[A":keyPad|=UpBit;break;
						case "[B":keyPad|=DownBit;break;
						case "[C":keyPad|=RightBit;break;
						case "[D":keyPad|=LeftBit;break;
						case "[2~":keyPad|=InsertBit;break;
						case "[3~":keyPad|=DeleteBit;break;
						case "[5~":keyPad|=PageUpBit;break;
						case "[6~":keyPad|=PageDownBit;break;
						case "[H":keyPad|=HomeBit;break;
						case "[F":keyPad|=EndBit;break;
						default:{
							console.log("[ESC]",sequence);
						}
					}
//					console.log("[ESC]",{keyPad,sequence});
				}else{
//					console.log("Escape!");
					keyPad|=QuitBit;
//					stopTerminal();
				}
				// onEscape
				break;
		}
	}    
	const hitBits=(mouseButtons<<10)|(keyPad);
	mouseButtons=0;
	keyPad=0;
	updatePumps(hitBits);
	const pad0=	{hitBits,axisX:pump[LEFTRIGHT],axisY:pump[UPDOWN],mouseX,mouseY};
	return pad0;
}
