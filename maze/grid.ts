// grid.ts

import { replaceText, sleep, isRunning, stopRunning, keyboardTask, pollKeyboard } from "./terminal.ts";

console.log("grid 0.1 - q to quit")

const quads=" ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█";

function blocks(lane0:Uint8Array,lane1:Uint8Array){
    let lane="";
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

let defaultGrid=new Uint8Array([27, 91, 65]);
let grid=defaultGrid;

export function scanKeyboard(){
    let queue:Uint8Array[]=pollKeyboard();
    for(let index=0;index<queue.length;index++){
        let keys=queue[index];
        if(keys[0]==32) {
//         grid=updateGrid(grid,emit);
        }
        if(keys[0]==27) {
            if(keys.length==1) grid=defaultGrid;
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

let up="\x1b[A";
let erase="\x1b[K";

const encoder=new TextEncoder();

keyboardTask()

while(isRunning()){

    console.log("grid goes here",pump,erase);

    Deno.stdout.write(encoder.encode(up));

    await sleep(10);
//    grid=updateGrid(grid,rules);

    fadePumps();
    scanKeyboard();

}

stopRunning();
