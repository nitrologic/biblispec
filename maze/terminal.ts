// terminal.ts

// traffic.ts imports replaceText sleep, isRunning, stopRunning, keyboardTask, pollKeyboard from here

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

export async function keyboardTask() {
    Deno.stdin.setRaw(true);
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
