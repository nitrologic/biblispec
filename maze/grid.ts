// grid.ts - a biblispec scroller

// - an exploration of Surrogate Pair Breakage featuring Astral Plane Characters

import conway from "../books/conway.json" with { type: "json" };
import { writeConsole, setCursor, replaceText, sleep, isRunning, stopRunning } from "./terminal.ts";
import { BitGrid } from "./bitgrid.js";

// deno Foreign Function Interface
const ffiPath = Deno.build.os === "darwin"  ? "./macosffi.ts" : "./win32ffi.ts";
const { pollKeyboard, pollMouse, initMidi, pollMidi, closeMidi } = await import(ffiPath);

const hasMidi=initMidi();

const gridTitle="☰ nitrologic grid 0.7.5 - Arrows, Space, Esc to Quit "+(hasMidi?"midi":"nomidi");

const dotBlockWide=2;
const dotBlocks=["⚫","🟠","🟡","🟢","🔴","🔵","🟧","🟨","🟩","🟥","🟦"];

const menuChars="******************* ";

let midiCount=0;
let midiMessage=null;
let gridMillis=50;

function onMidi(status:number, data1:number, data2:number){
	midiMessage={status,data1,data2};
	if(status==176){
		if(data1==14){
			gridMillis=260-data2*2;

		}
	}
	midiCount++;	
}
function range(startChar = 'A',endChar = 'Z'){
	const startCode = startChar.charCodeAt(0);
	const endCode = endChar.charCodeAt(0);
	const codes = Array.from({ length: endCode - startCode + 1 }, (_, i) =>   String.fromCharCode(startCode + i));
	return codes.join('');
}

// bitgrid display modes

//   1x1 fixed width characters
// * 1x1 wide unicode codepoints
//   2x2 quad block character
//   1x2 true color block

const gridQuads=" ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█";

// grid block display is 1:1 char per pixel resolution

const gridBlocks=" ▣▥▤▦▢";

let vidWidth=72*2;
let vidHeight=22;

let gridWidth=22*8*2;
let gridHeight=23*8;

function mirror(shape:string[]):string[]{
	let result=[];
	for(let line of shape){
		result.push(line.split("").reverse().join(""));
	}
	return result;
}

// four directions of shape using x y symmetry flips
function axis(glider:string[]){
	return [
		glider,
		glider.toReversed(),
		mirror(glider),
		mirror(glider).toReversed()
	];
}

const bitgrid = new BitGrid(gridWidth,gridHeight,4);

//bitgrid.rect(4,2,2,20);
//bitgrid.rect(gridWidth/4-10,4,8,20);

let blinker=conway.shapes.oscillators.blinker;
let beacon=conway.shapes.oscillators.beacon;
let pent=conway.shapes.methuselahs.rPentomino;

let pulsar=conway.shapes.oscillators.pulsar;

const glider=axis(conway.shapes.spaceships.glider);

function draw(shape:string[],x:number,y:number,layer:number){
	bitgrid.drawMask(shape,"O",x,y,layer);
}

/*
let keys=Object.keys(conway.shapes.still);
let x=10;
for(let index of keys){
	const still=conway.shapes.still[index];
	draw(still,x,80,2);
	x+=12;
}
*/

let keys1=Object.keys(conway.shapes.oscillators);
let x1=10;
for(let index of keys1){
	const shape=conway.shapes.oscillators[index];
	draw(shape,x1,100,2);
	x1+=12;
}

//draw(beacon,10,10,2);
//draw(pent,100,14,2);

draw(glider[0],20,35,2);
draw(glider[1],20,30,2);
draw(glider[2],10,30,2);
draw(glider[3],10,20,2);

for(let i=0;i<10;i++){
	for(let j=0;j<5;j++){
		draw(pulsar,62+i*25,14+j*17,2);
	}
}

bitgrid.stepConwayLife(2,3);

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
	let w=bitgrid.width*2-vidWidth;
	if(w<10) w=10;
	if(cursorX>=w){
		cursorX=w;
		cursorVX=0;
	}

	let h=bitgrid.height*4-vidHeight*4;
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

function gridHeatmap12():string[]{
	const result=[];
	for(let i=0;i<4096;i++){
		const r=((i>>8)&15)*12;
		const g=((i>>4)&15)*12;
		const b=((i>>0)&15)*12;
		const line=""+r+";"+g+";"+b;
		result[i]=line;
	}
	return result;
}

function gridHeatmap():string[]{
	const result=[];
	for(let i=0;i<512;i++){
		const r=((i>>6)&7)*18;
		const g=((i>>3)&7)*18;
		const b=((i>>0)&7)*18;
		const line=""+r+";"+g+";"+b;
		result[i]=line;
	}
	return result;
}

const heatRGBColors=gridHeatmap();
function heatRGB(heat:number):string{
	const n=heatRGBColors.length-1;
	let h=heat|0;
	if(h<0) h=0;
	if(h>n) h=n;
	return heatRGBColors[h];
}

function gridHalfWindowLayer(grid:BitGrid,wx:number,wy:number,ww:number,wh:number){
	const w=grid.width;
	const heat:Uint16Array=grid.heatmap;
	const n=heatRGBColors.length-1;
	const result=[];
	const h=(wh/2)|0;
	for(let y=0;y<h;y++){
		let offset=(wy+y*2)*w+wx;
		let line=""
		for(let x=0;x<ww;x++){  
			const h0=heat[offset];
			const h1=heat[offset+w];
			const fg=heatRGB(h0);
			const bg=heatRGB(h1);
			const charBun="\x1b[38;2;"+fg+"m\x1b[48;2;"+bg+"m▀";
			line+=charBun;
			offset++;
		}
		if(y==h-1){
			line+="\x1b[38;2;"+heatRGB(4095)+"m\x1b[48;2;"+heatRGB(0)+"m";
		}
		result.push(line);
	}
	return result;
}

function gridDotWindowLayer(grid:BitGrid,dots:string[],wx:number,wy:number,ww:number,wh:number){
	const n=dots.length;
	const w=grid.width;
	const heat:Uint16Array=grid.heatmap;
	const result=[];
	for(let y=0;y<wh;y++){
		let offset=(wy+y)*w+wx;
		let line=""
		for(let x=0;x<ww;x++){  
			const h=(heat[offset])|0;
			const index=h?(1+(h%(n-1))):0;
			line+=dots[index];
			offset++;
		}
		result.push(line);
	}
	return result;
}

function gridBlockWindowLayer(grid:BitGrid,layer:number,wx:number,wy:number,ww:number,wh:number){
	let src:Uint32Array=grid.data;
	let span=grid.span;	
	let layerOffset=layer*(span*grid.height);
	let result=[];
	for(let y=0;y<wh;y++){
		let line=""
		for(let x=0;x<ww;x++){  
			let offset=layerOffset+(wy+y)*span+((wx+x)>>5);
			let shift=(wx + x) & 31;
			let bit=(src[offset]>>shift)&1;
			line+=gridBlocks[bit];
		}
		result.push(line);
	}
	return result;
}


function gridQuadWindowLayer(grid:BitGrid,layer:number,wx:number,wy:number,ww:number,wh:number){
	let src:Uint32Array=grid.data;
	let span=grid.span;	
	let layerOffset=layer*(span*grid.height);
	let result=[];
	let h=(wh/2)|0;
	let w=(ww/2)|0;
	for(let y=0;y<h;y++){
		let line=""
		for(let x=0;x<w;x++){  
			let offset=layerOffset+(wy+y*2)*span+((wx+x)>>4);
			let shift=((wx + x) & 15)<<1;
			let bit01=(src[offset]>>shift)&3;
			let bit23=(src[offset+span]>>shift)&3;
			let index=(bit23<<2)|bit01;
			line+=gridQuads[index];
		}
		result.push(line);
	}
	return result;
}

function gridQuadWindow(grid:BitGrid,layers:number[],wx:number,wy:number,ww:number,wh:number){
	const src:Uint32Array=grid.data;
	const span=grid.span;	
	const result=[];
	const h=(wh/2)|0;
	const w=(ww/2)|0;
	for(let y=0;y<h;y++){
		let line=""
		for(let x=0;x<w;x++){  
			const shift=((wx + x) & 15)<<1;
			const offset=(wy+y*2)*span+((wx+x)>>4);
			let bit01=0;
			let bit23=0;
			for(const layer of layers){
				const layerOffset=layer*(span*grid.height);
				bit01|=(src[layerOffset+offset]>>shift)&3;
				bit23|=(src[layerOffset+offset+span]>>shift)&3;
			}
			const index=(bit23<<2)|bit01;
			line+=gridQuads[index];
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

function updatePumps(keys:number){
	if(keys&1) pump[axis.UPDOWN]-=100;
	if(keys&2) pump[axis.UPDOWN]+=100;
	if(keys&4) pump[axis.LEFTRIGHT]-=72;
	if(keys&8) pump[axis.LEFTRIGHT]+=72;
	fadePumps();
}

let mainMenu=false;//true;

function menuWall(blocks:string[]){
	let result=[];
	for(let row of blocks){
		result.push(menuChars+row);
	}
	return result.join("\n")
}

function hitBackspace(){
	mainMenu=!mainMenu;
}

function hitSpace(){
	draw(glider[0],20,35,2);
}

function pushStatus(key:string,value:any){
	let text="[STATUS] key:"+key+", value:"+JSON.stringify(value);
	status.push(text);
}


function flattenChunks(chunks: Uint8Array[]): Uint8Array {
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

let cursorUp="\x1b[A";
let cursorErase="\x1b[K";
let cursorHome="\x1b[H";
let cursorClear="\x1b[2J\x1b[1;1H";

const encoder=new TextEncoder();

let status=["have glider will fly"];

let layer=0;
let count=0;
let entropy=0;
let appWidth=0;
let appHeight=0;
let oldKeys=0;

while(isRunning()){
	const { columns, rows } = Deno.consoleSize();
	vidWidth=columns-6;
	vidHeight=rows-6;
	if(vidWidth!=appWidth||vidHeight!=appHeight){
		appWidth=vidWidth;
		appHeight=vidHeight;
		console.log(cursorClear);
	}
	let menuWide=mainMenu?menuChars.length:0;

	let panx=(menuWide+cursorX)>>1;
	let pany=cursorY>>2;
//	let span=bitgrid.span;
	let wide=(vidWidth-menuWide);
	count++;
	if(true){//((count++)&7)==5){
		layer=1-layer;
		entropy=bitgrid.stepConwayLife(2+layer,3-layer);
		bitgrid.heat(3-layer,25);
	}
	bitgrid.cool(0.95);

	let blocks=gridDotWindowLayer(bitgrid,dotBlocks,panx,pany,wide/dotBlockWide,vidHeight);
//	let blocks=gridHalfWindowLayer(bitgrid,panx,pany,wide,vidHeight*2)
//	let blocks=gridBlockWindowLayer(bitgrid,0,cursorX,pany,wide,vidHeight);
//	let blocks=gridQuadWindowLayer(bitgrid,0,cursorX,pany,wide*2,vidHeight*2);
//	let blocks=gridQuadWindow(bitgrid,[0,3-layer],cursorX,pany,wide*2,vidHeight*2);	//2,3
	console.log(cursorHome);

	const message=JSON.stringify(midiMessage);
	const title=gridTitle+" ["+columns+","+rows+","+count+","+entropy+","+midiCount+"] message:"+message;
	console.log(title);//,"pumps:"+JSON.stringify(pump),"     ");

	let wall=(mainMenu)?menuWall(blocks):blocks.join("\n");
	console.log(wall);
	let latest=status.slice(-13);
	console.log(latest.join("\n"));
//	let code=setCursor(5,7);
//	writeConsole(code);
	console.log("\x1b[0m");
	await sleep(gridMillis);

	// {status: number;data1: number;data2: number;}
	const midiEvents = pollMidi();
	for (const event of midiEvents) {
		onMidi(event.status, event.data1, event.data2);
	}

	const keys=pollKeyboard();
	if((keys&16)&&!(oldKeys&16)) hitSpace();
	if((keys&32)&&!(oldKeys&32)) hitBackspace();
	if((keys&64)&&!(oldKeys&64)) stopRunning();
	oldKeys=keys;
	updatePumps(keys);
	updateCursor();
}

//const code1=setCursor(1,vidHeight+2);
//writeConsole(code1);

stopRunning();
console.log("bye!");

closeMidi();
