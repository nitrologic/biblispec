// grid.ts

import { writeConsole, BitGrid, setCursor, replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollKeyboard } from "./terminal.ts";

let vidWidth=72;
const vidHeight=16;

let gridWidth=22*8*2;
let gridHeight=23*8*2;

const gridTitle="☰ grid 0.5 - q to quit, backspace - edit mode";

const gridBitmap = new BitGrid(gridWidth,gridHeight);

function updateCursor(){
	cursorVX+=(pump[axis.LEFTRIGHT])/400;
	cursorVY+=(pump[axis.UPDOWN])/400;
	cursorX+=cursorVX;
	if(cursorX<0){
		cursorX=0;cursorVX=0;
	}
	let w=gridBitmap.span*4-vidWidth;
	let h=gridBitmap.height*4-vidHeight*8;
	if(cursorX>=w){
		cursorX=w;
		cursorVX=0;
	}
	cursorY+=cursorVY;
	if(cursorY<0){
		cursorY=0;
		cursorVY=0;
	}
	if(cursorY>h){
		cursorY=h;
		cursorVY=0;
	}
	cursorVX *= 0.9;
	cursorVY *= 0.9;
}

function resetGrid(){	
}

const quads=" ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█";

function gridQuadWindow(src:Uint8Array,span:number,wx:number,wy:number,ww:number,wh:number){
	let result=[];
	let h=(wh/2)|0;
	let w=(ww/2)|0;
	for(let y=0;y<h;y++){
		let line=""
		for(let x=0;x<w;x++){  
			let offset=(wy+y*2)*span+((wx+x)>>2);
			let shift=((wx + x) & 3)<<1;
			let bit01=(src[offset]>>shift)&3;
			let bit23=(src[offset+span]>>shift)&3;
			let index=(bit23<<2)|bit01;
			line+=quads[index];
		}
		result.push(line);
	}
	return result;
}

enum axis {UPDOWN, LEFTRIGHT};
const pump:number[]=[0,0];

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

let mainMenu=false;//true;

function menuWall(blocks:string[]){
	let result=[];
	for(let row of blocks){
		result.push("*****"+row);
	}
	return result.join("\n")
}

function backSpace(){
	mainMenu=!mainMenu;
}

function pushStatus(key:string,value:any){
	let text="[STATUS] key:"+key+", value:"+JSON.stringify(value);
	status.push(text);
}

export function scanKeyboard(){
	let queue:Uint8Array[]=pollKeyboard();
	for(let index=0;index<queue.length;index++){
		let keys=queue[index];
		pushStatus("keyboard.keys",keys);
//		status.push(JSON.stringify(keys));
		if(keys[0]==127) {// BACKSPACE
			backSpace();
		}
		if(keys[0]==32) {
//         grid=updateGrid(grid,emit);
		}
		if(keys[0]==27) {
			if(keys.length==1) resetGrid();
			let up=(keys.length>2) && ((keys[1]==91)&&(keys[2]==65));
			let down=(keys.length>2) && ((keys[1]==91)&&(keys[2]==66));
			let right=(keys.length>2) && ((keys[1]==91)&&(keys[2]==67));
			let left=(keys.length>2) && ((keys[1]==91)&&(keys[2]==68));
			if(up) pump[axis.UPDOWN]-=200;
			if(down) pump[axis.UPDOWN]+=200;
			if(right) pump[axis.LEFTRIGHT]+=200;
			if(left) pump[axis.LEFTRIGHT]-=200;
		}else{
			status.push(JSON.stringify(keys));
		}
	}
}

let cursorX=0;
let cursorVX=0;
let cursorY=0;
let cursorVY=0;

let cursorUp="\x1b[A";
let cursorErase="\x1b[K";
let cursorHome2="\x1b[H";
let cursorHome="\x1b[2J\x1b[1;1H";

const encoder=new TextEncoder();

let status=["simon was here"];

keyboardMouseTask()

while(isRunning()){
	const { columns, rows } = Deno.consoleSize();
	vidWidth=columns-20;
	let pany=cursorY>>2;
	let span=gridBitmap.span;
	let menuWide=mainMenu?5:0;
	let wide2=(vidWidth-menuWide)*2;
	let blocks=gridQuadWindow(gridBitmap.data,span,cursorX,pany,wide2,vidHeight*2);

	console.log(cursorHome);
	console.log(gridTitle+" "+columns+"x"+rows);
	let wall=(mainMenu)?menuWall(blocks):blocks.join("\n");
	console.log(wall);
	let latest=status.slice(-3);
	console.log(latest.join("\n"));

	let code=setCursor(5,7);
	writeConsole(code);

	await sleep(50);
//    grid=updateGrid(grid,rules);
	fadePumps();
	scanKeyboard();
	updateCursor();
}

stopRunning();
