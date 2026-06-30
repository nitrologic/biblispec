// traffic.ts

console.log("traffic 0.2 - q to quit")

let running=true;
const encoder=new TextEncoder();

enum axis {UP, DOWN, RIGHT, LEFT};
const pump:number[]=[0,0,0,0];

function fadePumps(){
	for(let index=0;index<pump.length;index++){
		let integral:number=pump[index]|0;
		let fade=(integral>>2);
		integral=(fade)?integral-fade:0;
		pump[index]=integral;
	}
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

//Movement - cars ▣▣▣ moves right one cell if clear
//  ▢▣▣▣▢  →  ▢▢▣▣▣
// ▤▥▦▧▨▩

function replaceText(text: string, search: string, replace: string, leftToRight:boolean=true) : string {
	if (leftToRight) return text.replaceAll(search, replace);
	const reversed = Array.from(text).reverse().join("");
	const revSearch = Array.from(search).reverse().join("");
	const revReplace = Array.from(replace).reverse().join("");
	const res = reversed.replaceAll(revSearch, revReplace);
	return Array.from(res).reverse().join("");
}

Deno.stdin.setRaw(true);

let keyboardQueue:Uint8Array[]=[];
const keyboardBuffer = new Uint8Array(10);

async function keyboardTask() {
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

function updateLane(lane:string,map:any){
	for(let key in map){
		let value=map[key];
		lane=replaceText(lane,key,value,false);
	}
	return lane;
}

let rules={
	"▤▢▢▢▢▢":"▥▢▣▣▣▢",
	"▣▣▣▦▢":"▢▢▢▦▣",
	"▣▣▣▦▣":"▢▢▢▦▣",
	"▢▣▣▣▢":"▢▢▣▣▣"
}

let shoot={
	"▥▢▢▢▢▢":"▤▢▢▢▢▢"
}

keyboardTask()

let defaultLane="▤"+"▢".repeat(40)+"▦▢";
let up="\x1b[A";

let lane=defaultLane;

while(running){

	console.log(lane,pump);

	Deno.stdout.write(encoder.encode(up));

	await sleep(20);
	lane=updateLane(lane,rules);

	fadePumps();

	let queue:Uint8Array[]=keyboardQueue;
	keyboardQueue=[];
	for(let index=0;index<queue.length;index++){
		let keys=queue[index];
		if(keys[0]==32) lane=updateLane(lane,shoot);
		if(keys[0]==27) {
			lane=defaultLane;
			let up=(keys.length>2) && ((keys[1]==91)&&(keys[2]==65));
			let down=(keys.length>2) && ((keys[1]==91)&&(keys[2]==66));
			let right=(keys.length>2) && ((keys[1]==91)&&(keys[2]==67));
			let left=(keys.length>2) && ((keys[1]==91)&&(keys[2]==68));
			if(up) pump[axis.UP]+=100;
			if(down) pump[axis.DOWN]+=100;
			if(right) pump[axis.RIGHT]+=100;
			if(left) pump[axis.LEFT]+=100;
//			console.log("\nescape\n",keys,left?"L":"*",right?"R":"*",up?"U":"*",down?"D":"*");
		}
		else{
//			console.log("\nkeys\n",keys);
		}
	}
}

Deno.stdin.setRaw(false);
running=false
