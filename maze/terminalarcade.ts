// terminalarcade.ts

const UpBit=1;
const DownBit=2;
const LeftBit=4;
const RightBit=8;
const SpaceBit=16;
const BackspaceBit=32;

const MouseLeftBit=1;
const MouseRightBit=2;
const MouseMotionBit=4;

// export function list

// writeConsole 
// replaceText 
// setCursor
// sleep 
// pollKeypad
// runTerminal pollTerminal stopTerminal 

// pumps

enum axis {UPDOWN, LEFTRIGHT};
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
	if(keys&1) pump[axis.UPDOWN]-=100;
	if(keys&2) pump[axis.UPDOWN]+=100;
	if(keys&4) pump[axis.LEFTRIGHT]-=72;
	if(keys&8) pump[axis.LEFTRIGHT]+=72;
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
			console.log("[E]",e);
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

export interface KeypadState {
  hitBits: number;
  x: number,
  y: number
}


const decoder = new TextDecoder();
let keyPad=0;
let mouseButtons=0;

export function pollKeypad():KeypadState{
	let queue:Uint8Array[]=pollTerminal();
	for(let index=0;index<queue.length;index++){
		let keys=queue[index];
		const rawKey=keys[0];
		switch(rawKey){
			case 127:
				keyPad|=BackspaceBit;
				break;
			case 32:
				keyPad|=SpaceBit;
				break;
			case 27:
				if(keys.length>1){
					const sequence=decoder.decode(keys.subarray(1));
					if(sequence.startsWith("[<")){
						//35;53;11M")
						const m3=sequence.substring(2).split(";");
						const b=parseInt(m3[0]);
						const x=parseInt(m3[1]);
						const y=parseInt(m3[2]);
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
						default:{
							console.log("[ESC]",sequence);
						}
					}
//					console.log("[ESC]",{keyPad,sequence});
				}else{
					console.log("Escape!");
					stopTerminal();
				}
				// onEscape
				break;
		}
	}    
	const hitBits=(mouseButtons<<10)|(keyPad);
	mouseButtons=0;
	keyPad=0;
	updatePumps(hitBits);
	return {hitBits,x:pump[axis.UPDOWN],y:pump[axis.LEFTRIGHT]};
}
