// traffic.ts

import { replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollKeyboard } from "./terminal.ts";

console.log("traffic 0.4 - q to quit")

enum axis {UP, DOWN, RIGHT, LEFT};
const pump:number[]=[0,0,0,0];

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

function updateLane(lane:string,map:any){
	for(let key in map){
		let value=map[key];
		lane=replaceText(lane,key,value,false);
	}
	return lane;
}

export function scanKeyboard(){
	let queue:Uint8Array[]=pollKeyboard();
	for(let index=0;index<queue.length;index++){
		let keys=queue[index];
		if(keys[0]==32) {
			lane=updateLane(lane,emit);
		}
		if(keys[0]==27) {
			if(keys.length==1) lane=defaultLane;
			let up=(keys.length>2) && ((keys[1]==91)&&(keys[2]==65));
			let down=(keys.length>2) && ((keys[1]==91)&&(keys[2]==66));
			let right=(keys.length>2) && ((keys[1]==91)&&(keys[2]==67));
			let left=(keys.length>2) && ((keys[1]==91)&&(keys[2]==68));
			if(up) pump[axis.UP]+=200;
			if(down) pump[axis.DOWN]+=200;
			if(right) pump[axis.RIGHT]+=200;
			if(left) pump[axis.LEFT]+=200;
		}
	}
}

let rules={
	"▤▢▢▢▢▢":"▥▢▣▣▣▢",
	"▣▣▣▦▢":"▢▢▢▦▣",
	"▣▣▣▦▣":"▢▢▢▦▣",
	"▢▣▣▣▢":"▢▢▣▣▣"
}

let emit={
	"▥▢▢▢▢▢":"▤▢▢▢▢▢"
}

const encoder=new TextEncoder();
let defaultLane="▤"+"▢".repeat(40)+"▦▢";
let up="\x1b[A";
let erase="\x1b[K";
let lane:string=defaultLane;

keyboardMouseTask()

while(isRunning()){

	console.log(lane,pump,erase);

	Deno.stdout.write(encoder.encode(up));

	await sleep(10);
	lane=updateLane(lane,rules);

	fadePumps();
	scanKeyboard();

}

stopRunning();
