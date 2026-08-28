// vanilla.js
// (c)2026 nitrologic
// biblispec MIT License
// https://opensource.org/licenses/MIT
// https://nitrologic.github.io/biblispec

// runs life in bitgrid - see bitgrid.js for more info
// vidConsole is textarea element with id="console"
// see initGrid for animationframe on tick update mechanism

// backspace launches a new glider

"use strict"

console.log("biblispec vanilla life demo 0.2.1");

//const friendEmoji="🟩🟦🐨🐼🐸🐰🐭🐯🐱🐶🐵🐥🐷🦧🐺🦊🦝🦁🦉";
const friendEmoji="⬛🟦🐨🐼🐸🐰🐭🐯🐱🐶🐵🐥🐷🦧🐺🦊🦝🦁🦉";
const friends=[...friendEmoji];

const dotBlockWide=2;

let vidConsole;
let statusDiv;

let vidWidth=72*2;
let vidHeight=22;
let displayDirty=false;

function pollDimensions(){
	const w=vidConsole.clientWidth;
	const h=vidConsole.clientHeight;
	let vw=((w/10)|0);
	let vh=((h/18)|0);
	if((vidWidth!=vw)||(vidHeight!=vh)){
		vidWidth=vw;
		vidHeight=vh;
		displayDirty=true;
	}
}

let gridWidth=22*8*4;
let gridHeight=23*8;

// vanillaGui

const pump=[0,0];

const UPDOWN=0;
const LEFTRIGHT=1;

const pressedKeys={};

function onKeyUp(e){
	const key = e.key;
	const code = e.code;
	pressedKeys[key]=false;
}

function onKeyDown(e){
	const key = e.key;
	const code = e.code;
	pressedKeys[key]=true;
	if (key === "Enter") {
		e.preventDefault(); // Stop newline creation
		console.log("Execute terminal command!");
	}
	if (key === "Tab") {
		e.preventDefault(); // Stop focus from leaving the textarea
		console.log("Trigger auto-complete!");
	}
}

function onMouse(e){
//	console.log({e});
}
function onMouseMove(e){
	if(e.buttons&1){
		const x=e.movementX*4;
		const y=e.movementY*4;
		pump[1]+=x;
		pump[0]+=y;
//		console.log("[vanilla]",{x,y});
	}
}

let startTime = null;
let tickTime = null;

function initGui(terminal){
	console.log("[vanilla]","initGui");
	terminal.addEventListener("mousedown",onMouse);
	terminal.addEventListener("mousemove",onMouseMove);
	terminal.addEventListener("mouseup",onMouse);
	terminal.addEventListener("keydown",onKeyDown);
	terminal.addEventListener("keyup",onKeyUp);
}

function mirror(shape){
	let result=[];
	for(let line of shape){
		result.push(line.split("").reverse().join(""));
	}
	return result;
}

// four directions of shape using x y symmetry flips
function axis(glider){
	return [
		glider,
		glider.toReversed(),
		mirror(glider),
		mirror(glider).toReversed()
	];
}

// create bitgrid, add bunch of conway elements, 4 gliders, and a grid of pulsars

const bitgrid = new BitGrid(gridWidth,gridHeight,4);

let blinker=conway.shapes.oscillators.blinker;
let beacon=conway.shapes.oscillators.beacon;
let pent=conway.shapes.methuselahs.rPentomino;

let pulsar=conway.shapes.oscillators.pulsar;

const glider=axis(conway.shapes.spaceships.glider);

function draw(shape,x,y,layer){
	bitgrid.drawMask(shape,"O",x,y,layer);
}

let keys1=Object.keys(conway.shapes.oscillators);
let x1=10;
for(let index of keys1){
	const shape=conway.shapes.oscillators[index];
	draw(shape,x1,100,2);
	x1+=12;
}

draw(glider[0],20,35,2);
draw(glider[1],20,30,2);
draw(glider[2],10,30,2);
draw(glider[3],10,20,2);

for(let i=0;i<12;i++){
	for(let j=0;j<5;j++){
		draw(pulsar,62+i*25,14+j*17,2);
	}
}

// swipe manager

let cursorX=0;
let cursorVX=0;
let cursorY=0;
let cursorVY=0;

function updateCursor(){
	cursorVX+=(pump[LEFTRIGHT])/400;
	cursorVY+=(pump[UPDOWN])/400;

	cursorX+=cursorVX;
	if(cursorX<0){
		cursorX=0;cursorVX=0;
	}
	let w=bitgrid.width-vidWidth;
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

function gridHeatmap12(){
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

function gridHeatmap(){
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
function heatRGB(heat){
	const n=heatRGBColors.length-1;
	let h=heat|0;
	if(h<0) h=0;
	if(h>n) h=n;
	return heatRGBColors[h];
}

function gridDotWindowLayer(grid,dots,wx,wy,ww,wh){
	const n=dots.length;
	const w=grid.width;
	const heat=grid.heatmap;
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

function fadePumps(){
	const previous = [...pump];
	for(let index=0;index<pump.length;index++){
		let integral=pump[index]|0;
		let fade=(integral>>3);
		integral=(fade)?integral-fade:0;
		pump[index]=integral;
	}
	return previous;
}

function updatePumps(keys){
	if(keys&1) pump[UPDOWN]-=100;
	if(keys&2) pump[UPDOWN]+=100;
	if(keys&4) pump[LEFTRIGHT]-=72;
	if(keys&8) pump[LEFTRIGHT]+=72;
	fadePumps();
}

function backSpace(){
//	mainMenu=!mainMenu;
	draw(glider[0],20,35,2);
}

function pushStatus(key,value){
	let text="[STATUS] key:"+key+", value:"+JSON.stringify(value);
	status.push(text);
}

function flattenChunks(chunks) {
	const count = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const result = new Uint8Array(count);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	return result;
}

let layer=0;
let count=0;
let entropy=0;

let pattern=friends;

// updates based on global cursorXY

function conwayLifeFrame(){
	count++;
	if(true){//((count++)&7)==5){
		layer=1-layer;
		entropy=bitgrid.stepConwayLife(2+layer,3-layer);
		bitgrid.heat(3-layer,25);
	}
	bitgrid.cool(0.95);
	const panx=cursorX>>1;
	const pany=cursorY>>2;
	const blocks=gridDotWindowLayer(bitgrid,pattern,panx,pany,vidWidth/dotBlockWide,vidHeight);
	return blocks.join("\n");
}

let tickCount=0;
let governor=4;
let previousFrame=0;
let recentKeys=0;

// initial frame generates layer 3 from layer 2

bitgrid.stepConwayLife(2,3);

function statusFrame(){
	return {vidWidth,vidHeight,gridWidth,gridHeight,governor,recentKeys};
}

const UpBit=1;
const DownBit=2;
const LeftBit=4;
const RightBit=8;

const HomeBit=16;
const EndBit=32;
const DeleteBit=64;
const InsertBit=128;

const PageUpBit=256;
const PageDownBit=512;
const QuitBit=1024;

function tick(timestamp) {
	if (!startTime) {
		startTime = timestamp;
		tickTime = timestamp;
	}
	const elapsed = timestamp - tickTime;
	tickTime = timestamp;

	requestAnimationFrame(tick);

	let refresh=true;
	tickCount++;
	if(governor){
		let frame=(tickCount/governor)|0;
		if(frame==previousFrame) refresh=false;
		previousFrame=frame;
	}

	if(refresh) {
		const start = vidConsole.selectionStart;
		const end = vidConsole.selectionEnd;
		vidConsole.value=conwayLifeFrame();
		vidConsole.selectionStart = start;
		vidConsole.selectionEnd = end;
		const status=JSON.stringify(statusFrame());
		const keys=JSON.stringify(pressedKeys);
		statusDiv.innerText=status+"\n"+keys;
	}

	const keys=
		(pressedKeys["ArrowUp"]?UpBit:0)|
		(pressedKeys["ArrowDown"]?DownBit:0)|
		(pressedKeys["ArrowRight"]?RightBit:0)|
		(pressedKeys["ArrowLeft"]?LeftBit:0)|
		(pressedKeys["Home"]?HomeBit:0)|
		(pressedKeys["End"]?EndBit:0)|
		(pressedKeys["Delete"]?DeleteBit:0)|
		(pressedKeys["Insert"]?InsertBit:0)|
		(pressedKeys["PageUp"]?PageUpBit:0)|
		(pressedKeys["PageDown"]?PageDownBit:0)|
		(pressedKeys["Escape"]?QuitBit:0);

	recentKeys=keys;

	updatePumps(keys);

//	pressedKeys["PageDown"]

	updateCursor();
}

function initGrid(){
	statusDiv=document.getElementById("status");
	const terminal=document.getElementById("console");
	vidConsole=terminal;
	initGui(terminal);
	pollDimensions();
	window.addEventListener("resize",pollDimensions);
	requestAnimationFrame(tick);
}

window.onload=initGrid;
