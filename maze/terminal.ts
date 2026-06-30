// terminal.ts

const encoder=new TextEncoder();

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
