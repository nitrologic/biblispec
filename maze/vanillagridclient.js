"use strict"

let vidWidth=72*2;
let vidHeight=22;

function resizeTerminal(){
	const w=terminal.clientWidth;
	const h=terminal.clientHeight;
	vidWidth=(w/16)|0;
	vidHeight=(h/32)|0
}


let gridWidth=22*8*4;
let gridHeight=23*8;

const UPDOWN=0;
const LEFTRIGHT=1;

const pump=[0,0];

let terminal;

let dotBlocks=["⚫","🟠","🟡","🟢","🔴","🔵","🟣","🟤","🟧","🟨","🟩","🟥","🟦","🟪","🟫","🧡","💛","💚","💙","💜","🤎"];
const dotBlockWide=2;

const friendEmoji="🐨🐼🐸🐰🐭🐯🐱🐶🐵🐥🐷🦧🐺🦊🦝🦁🦉";
const friends=[...friendEmoji];

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
		console.log({x,y});
	}
}

function initGrid(){
	terminal=document.getElementById("terminal");
//	terminal.value+="\n123\n"+friends[1]+"\n";
	console.log("initGrid");
	resizeTerminal();
	terminal.value=testFrame();
	requestAnimationFrame(tick);
	terminal.addEventListener("mousedown",onMouse);
	terminal.addEventListener("mousemove",onMouseMove);
	terminal.addEventListener("mouseup",onMouse);
	terminal.addEventListener("keydown",onKeyDown);
	terminal.addEventListener("keyup",onKeyUp);
}

let startTime = null;

function tick(timestamp) {
	if (!startTime) startTime = timestamp;
	const elapsed = timestamp - startTime;
	resizeTerminal();
	terminal.value=testFrame();
	requestAnimationFrame(tick);
	const keys=
		(pressedKeys["ArrowUp"]?1:0)|
		(pressedKeys["ArrowDown"]?2:0)|
		(pressedKeys["ArrowRight"]?8:0)|
		(pressedKeys["ArrowLeft"]?4:0);
	updatePumps(keys);
	updateCursor();
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

const bitgrid = new BitGrid(gridWidth,gridHeight,4);

//bitgrid.rect(4,2,2,20);
//bitgrid.rect(gridWidth/4-10,4,8,20);

let blinker=conway.shapes.oscillators.blinker;
let beacon=conway.shapes.oscillators.beacon;
let pent=conway.shapes.methuselahs.rPentomino;

let pulsar=conway.shapes.oscillators.pulsar;

const glider=axis(conway.shapes.spaceships.glider);

function draw(shape,x,y,layer){
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

for(let i=0;i<12;i++){
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

let mainMenu=false;//true;

function menuWall(blocks){
	let result=[];
	for(let row of blocks){
		result.push("*****"+row);
	}
	return result.join("\n")
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

function testFrame(){
	count++;
	if(true){//((count++)&7)==5){
		layer=1-layer;
		entropy=bitgrid.stepConwayLife(2+layer,3-layer);
		bitgrid.heat(3-layer,25);
	}
	bitgrid.cool(0.95);
	let panx=cursorX>>1;
	let pany=cursorY>>2;
	let blocks=gridDotWindowLayer(bitgrid,dotBlocks,panx,pany,vidWidth/dotBlockWide,vidHeight);
	return blocks.join("\n");
}
