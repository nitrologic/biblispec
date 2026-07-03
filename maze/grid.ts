// grid.ts - a biblispec scroller

import { writeConsole, setCursor, replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollInput } from "./terminal.ts";
import { BitGrid } from "./bitgrid.js";

const gridTitle="☰ grid 0.7 - arrows, space, q to quit, backspace to edit";

let vidWidth=72;
const vidHeight=16;

let gridWidth=22*8*8;
let gridHeight=23*8;

const bitgrid = new BitGrid(gridWidth,gridHeight,4);
bitgrid.rect(4,2,2,20);
bitgrid.rect(gridWidth/4-10,4,8,20);

let cursorX=0;
let cursorVX=0;
let cursorY=0;
let cursorVY=0;

function updateCursor(){
	cursorVX+=(pump[axis.LEFTRIGHT])/400;
	cursorVY+=(pump[axis.UPDOWN])/400;
	cursorX+=cursorVX;
	if(cursorX<0){
		cursorX=0;cursorVX=0;
	}
	let w=bitgrid.span*4-vidWidth;
	let h=bitgrid.height*4-vidHeight*8;
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

function gridQuadWindow(grid:BitGrid,page:number,wx:number,wy:number,ww:number,wh:number){
	let src:Uint32Array=grid.data;
	let span=grid.span;	
	let pageOffset=page*(span*grid.height);
	let result=[];
	let h=(wh/2)|0;
	let w=(ww/2)|0;
	for(let y=0;y<h;y++){
		let line=""
		for(let x=0;x<w;x++){  
			let offset=pageOffset+(wy+y*2)*span+((wx+x)>>4);
			let shift=((wx + x) & 15)<<1;
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


export function flattenChunks(chunks: Uint8Array[]): Uint8Array {
	const count = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const result = new Uint8Array(count);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	return result;
}

let inputBuffer = new Uint8Array(0);
const decoder = new TextDecoder();

export function scanGridKeyboard(){
	const queue:Uint8Array=flattenChunks(pollInput());
	const n = inputBuffer.length + queue.length;
	const input = new Uint8Array(n);
	input.set(inputBuffer);
	input.set(queue, inputBuffer.length);
	let index=0;
	for(index=0;index<n;index++){
		let key=input[index];
		if(key==127) {// BACKSPACE
			backSpace();
			continue
		}
		if(key==32) {
//         grid=updateGrid(grid,emit);
			continue
		}
/*
		pushStatus("keyboard.keys",input);
		index=n;
		break;
*/		
		if(key==27) {
			if(index==n-1){
				resetGrid();
				continue;
			}
			if(index+2<n && input[index+1]==91){
				const keycode=input[index+2];
				const up=keycode==65;
				const down=keycode==66;
				const right=keycode==67;
				const left=keycode==68;
				if(up) pump[axis.UPDOWN]-=200;
				if(down) pump[axis.UPDOWN]+=200;
				if(right) pump[axis.LEFTRIGHT]+=200;
				if(left) pump[axis.LEFTRIGHT]-=200;
				index+=2;
			}else{
				pushStatus("keyboard.escape",input);
			}
		}else{
			// 49 77
			pushStatus("keyboard.keys",input);
		}			
	}
	inputBuffer = input.slice(index);
}

let cursorUp="\x1b[A";
let cursorErase="\x1b[K";
let cursorHome2="\x1b[H";
let cursorHome="\x1b[2J\x1b[1;1H";

const encoder=new TextEncoder();

let status=["simon was here"];

keyboardMouseTask()

let page=0;

while(isRunning()){
	const { columns, rows } = Deno.consoleSize();
	vidWidth=columns-12;
	
	let pany=cursorY>>2;
	let span=bitgrid.span;
	let menuWide=mainMenu?5:0;
	let wide2=(vidWidth-menuWide)*2;

//	page=1-page;
//	stepLife(bitgrid,page,1-page);

	let blocks=gridQuadWindow(bitgrid,0,cursorX,pany,wide2,vidHeight*2);

	console.log(cursorHome);
	console.log(gridTitle+" ["+columns+","+rows+"]");
	let wall=(mainMenu)?menuWall(blocks):blocks.join("\n");
	console.log(wall);
	let latest=status.slice(-13);
	console.log(latest.join("\n"));

	let code=setCursor(5,7);
	writeConsole(code);

	await sleep(50);
//    grid=updateGrid(grid,rules);
	fadePumps();
	scanGridKeyboard();
	updateCursor();
}

const code1=setCursor(1,vidHeight+2);
writeConsole(code1);
stopRunning();
