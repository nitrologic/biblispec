// terminal.ts - Text User Interface console operations

// traffic.ts and grid.ts import from here

// export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
// export function writeConsole(text:string)
// export function isRunning()
// export function stopRunning()
// export function pollInput():Uint8Array[]{
// export async function keyboardMouseTask(enableMouse:boolean=false) {
// export function setCursor(col: number,row: number): string
// export function replaceText(text: string, search: string, replace: string, leftToRight:boolean=true) : string

// sleep - await sleep(20);

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// writeConsole

const encoder=new TextEncoder();

export function writeConsole(text:string){
	Deno.stdout.write(encoder.encode(text));
}

// isRunning

let running=true;

export function isRunning(){
	return running;
}

// stopRunning
// todo - opt in closeMidi

export function stopRunning(){
	Deno.stdin.setRaw(false);
	console.log(resetConsole);
	running=false;
}

let keyboardQueue:Uint8Array[]=[];
const keyboardBuffer = new Uint8Array(10);

let inputTask=null;

export function pollInput():Uint8Array[]{
	if(!inputTask) inputTask=keyboardMouseTask(true);
	const queue=keyboardQueue;
	keyboardQueue=[];
	return queue;
}

// note: keyboardMouseTask export scheduled to be made private

export async function keyboardMouseTask(enableMouse:boolean=false) {
	Deno.stdin.setRaw(true);
	if(enableMouse){
		Deno.stdout.writeSync(encoder.encode("\x1b[?1003h\x1b[?1006h\x1b[?25l"));	
		console.log("mouseOn");
	}
	while (running) {
		const bytesRead = await Deno.stdin.read(keyboardBuffer); 
		if (bytesRead && keyboardBuffer[0] === 113) { // 113 = 'q'
			running = false;
			break;
		}
		const bytes=keyboardBuffer.subarray(0,bytesRead);
		keyboardQueue.push(bytes);
	}
	if(enableMouse){
		Deno.stdout.writeSync(encoder.encode("\x1b[?1003l\x1b[?1006l\x1b[?25h"));	
		console.log("mouseOff");
	}
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

// replaceText text, search, replace, clockwise

export function replaceText(text: string, search: string, replace: string, leftToRight:boolean=true) : string {
	if (leftToRight) return text.replaceAll(search, replace);
	const reversed = Array.from(text).reverse().join("");
	const revSearch = Array.from(search).reverse().join("");
	const revReplace = Array.from(replace).reverse().join("");
	const res = reversed.replaceAll(revSearch, revReplace);
	return Array.from(res).reverse().join("");
}
