// terminal.ts

// traffic.ts imports replaceText sleep, isRunning, stopRunning, keyboardMouseTask, pollInput from here

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

export function pollInput(){
    let queue=keyboardQueue;
    keyboardQueue=[];
    return queue;
}

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

export class BitGrid {
	public span=0;
	public data:Uint32Array;
	constructor(public width: number,public height: number, public pages: number) {
		this.span=(width+31)>>5;
		this.data=new Uint32Array(this.span*height*pages);
		this.grid(20,10,0);
	}
	public rect(x:number,y:number,width:number,height:number,page:number=0){
		const offset=page*this.height*this.span;
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				const wordIndex = row * this.span + (col >> 5);
				const bitIndex = col & 31;
				this.data[offset+wordIndex] |= (1 << bitIndex);
			}
		}    
	}
	public grid(skipx:number=20,skipy:number=10,page:number=0){
		let w=this.width;
		let h=this.height;
		for(let x=0;x<w;x+=skipx){
			this.rect(x,2,1,h-2,page);
		}
		this.rect(w-3,3,2,h-4,page);
		for(let y=0;y<h;y+=skipy){
			this.rect(0,y,w,1,page);
		}
		this.rect(3,h-3,w-4,2,page);
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