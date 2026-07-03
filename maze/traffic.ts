// traffic.ts

import { replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollInput } from "./terminal.ts";

console.log("traffic 0.6 - space to instance, q to quit")

let trafficSleep=20;//10;//60;
let trafficWidth=72;

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
let defaultLane="▤"+"▢".repeat(trafficWidth)+"▦▢";

const cursorUp="\x1b[A";
const cursorErase="\x1b[K";

let lane:string=defaultLane;

function updateLane(lane:string,map:any){
	for(let key in map){
		let value=map[key];
		lane=replaceText(lane,key,value,false);
	}
	return lane;
}

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

export function scanTrafficKeyboard(){
	let queue:Uint8Array[]=pollInput();
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

keyboardMouseTask()

while(isRunning()){

	console.log(lane,pump,cursorErase);

	Deno.stdout.write(encoder.encode(cursorUp));

	await sleep(trafficSleep);
	lane=updateLane(lane,rules);

	fadePumps();
	scanTrafficKeyboard();

}

stopRunning();
