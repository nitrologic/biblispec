// input.io - standard keyboard mouse console comms

// sets raw input on stdin

// exports startInput, pollInput stopInput

let running=false;

let keyboardQueue:Uint8Array[]=[];
const keyboardBuffer = new Uint8Array(10);

export function pollInput():Uint8Array[]{
	let queue=keyboardQueue;
	keyboardQueue=[];
	return queue;
}

const encoder=new TextEncoder();

export async function stoptInput(){
	Deno.stdin.setRaw(false);
	running=false;
}

export async function startInput(enableMouse:boolean=false) {
	running=true;
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
