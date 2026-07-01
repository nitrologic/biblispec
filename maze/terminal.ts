// terminal.ts

const mouseOn="\x1b[?1006h";

// traffic.ts imports replaceText sleep, isRunning, stopRunning, keyboardMouseTask, pollKeyboard from here

export function replaceText(text: string, search: string, replace: string, leftToRight:boolean=true) : string {
	if (leftToRight) return text.replaceAll(search, replace);
	const reversed = Array.from(text).reverse().join("");
	const revSearch = Array.from(search).reverse().join("");
	const revReplace = Array.from(replace).reverse().join("");
	const res = reversed.replaceAll(revSearch, revReplace);
	return Array.from(res).reverse().join("");
}

let running=true;

let keyboardQueue:Uint8Array[]=[];
const keyboardBuffer = new Uint8Array(10);

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function isRunning(){
    return running;
}

export function stopRunning(){
    Deno.stdin.setRaw(false);
    running=false;
}

export function pollKeyboard(){
    let queue=keyboardQueue;
    keyboardQueue=[];
    return queue;
}

export async function keyboardMouseTask() {
    Deno.stdin.setRaw(true);
	console.log(mouseOn);
	while (running) {
		const bytesRead = await Deno.stdin.read(keyboardBuffer); 
		if (bytesRead && keyboardBuffer[0] === 113) { // 113 = 'q'
			running = false;
			break;
		}
		const bytes=keyboardBuffer.subarray(0,bytesRead);
		keyboardQueue.push(bytes);
	}
}

export class BitGrid {
	public span=0;
	public data:Uint8Array;
	constructor(public width: number,public height: number) {
		this.span=(width+7)>>3;
		this.data=new Uint8Array(this.span*height);
		this.grid();
	}
	public rect(x:number,y:number,width:number,height:number){
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				const byteIndex = row * this.span + (col >> 3);
				const bitIndex = col & 7;
				this.data[byteIndex] |= (1 << bitIndex);
			}
		}    
	}
	public grid(skipx:number=20,skipy:number=10){
		let w=this.width;
		let h=this.height;
		for(let x=0;x<w;x+=skipx){
			this.rect(x,2,1,h-2);
		}
		this.rect(w-3,3,2,h-4);
		for(let y=0;y<h;y+=skipy){
			this.rect(0,y,w,1);
		}
		this.rect(3,h-3,w-4,2);
	}
};

const enableCursor="\x1b[?25h";
const disableCursor="\x1b[?25l";
let blinkFrame=0;
export function setCursor(col: number,row: number): string {
	let code=`\x1b[${row};${col}H`;
	const blink=((blinkFrame++)&16)==0;
	code+=blink?enableCursor:disableCursor;
	return code;
}

const encoder=new TextEncoder();

export function writeConsole(text:string){
	Deno.stdout.write(encoder.encode(text));
}