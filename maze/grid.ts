// grid.ts

import { replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollKeyboard } from "./terminal.ts";

let vidWidth=72;
const vidHeight=16;
	
const gridTitle="☰ grid 0.4 - q to quit, backspace - menu";

const quads=" ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█";

class Bitmap {
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
	public grid(){
		let w=this.width;
		let h=this.height;
		for(let x=0;x<w;x+=10){
			this.rect(x,2,1,h-2);
		}
		this.rect(w-3,3,2,h-4);
		for(let y=0;y<h;y+=4){
			this.rect(0,y,w,1);
		}
		this.rect(3,h-3,w-4,2);
	}
};

const gridBitmap = new Bitmap(22*8,23*8);
//bitmap.rect(0,0,22*8,1);

function updateCursor(){
	cursorVX+=(pump[axis.RIGHT]-pump[axis.LEFT])/400;
	cursorVY+=(pump[axis.DOWN]-pump[axis.UP])/400;
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

function gridWindow(src:Uint8Array,span:number,wx:number,wy:number,ww:number,wh:number){
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

let mainMenu=true;

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

export function scanKeyboard(){
	let queue:Uint8Array[]=pollKeyboard();
	for(let index=0;index<queue.length;index++){
		let keys=queue[index];
		status.push(JSON.stringify(keys));
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
			if(up) pump[axis.UP]+=200;
			if(down) pump[axis.DOWN]+=200;
			if(right) pump[axis.RIGHT]+=200;
			if(left) pump[axis.LEFT]+=200;
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
	let blocks=gridWindow(gridBitmap.data,span,cursorX,pany,wide2,vidHeight*2);

	console.log(cursorHome);
	console.log(gridTitle+" "+columns+"x"+rows);
	let wall=(mainMenu)?menuWall(blocks):blocks.join("\n");
	console.log(wall);
	let latest=status.slice(-3);
	console.log(latest.join("\n"));
	await sleep(10);
//    grid=updateGrid(grid,rules);
	fadePumps();
	scanKeyboard();
	updateCursor();
}

stopRunning();
