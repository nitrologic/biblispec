// centipede.ts

// ▁▂▃▄▅▆▇█▉▊▋▌▍▎▏▔▕
// ▏▕

//import { startInput, pollInput, stopInput } from "./input.ts";
import { writeConsole, setCursor, replaceText, sleep, isRunning, stopRunning } from "./terminal.ts";
import { CharGrid } from "./chargrid.js";

const ffiPath = Deno.build.os === "darwin"  ? "./macosffi.ts" : "./win32ffi.ts";
const { pollKeyboard, pollMouse, initMidi, pollMidi, closeMidi } =await import(ffiPath);

const cursorHome="\x1b[H";
const cursorClear="\x1b[2J\x1b[1;1H";

const grid = new CharGrid(30,25,4);
const digits="０１２３４５６７８９";
const chars="ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ";

grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],0,0,0);
grid.drawShape(["🍄 🍄🍄🍄🍄🍄🍄🍄🍄🍄"],1,1,0);
grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],1,5,0);
grid.drawShape(["🍄🍄 🍄🍄🍄🍄🍄🍄🍄"],0,7,0);
grid.drawShape([" 🍄  🍄🍄🍄  🍄🍄🍄"],1,10,0);

const gameTitle="☰ centipede 0.1 - Arrows Space Esc to quit";
console.log(cursorClear);

let ship="🤖";

let vlin=["▌","▐"];

let shipx=15;
let shipy=20

let joyx=0;

let mainMenu=false;

function resetGame(){
}

// 30x25
// 🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄

interface shot {cycles:number;x:number;y:number;}

let shots:Array<shot>=[];
let shotCount=0;
function pew(){
	shotCount++;
	shots.push({cycles:24,x:shipx+0.5+0.5*(shotCount&1),y:shipy});
}
function updateShots(){
	const result:Array<shot>=[];
	for(const shot of shots){
		grid.drawShape(" ",shot.x,shot.y);
		shot.y--;
		if(shot.cycles-->0){
			result.push(shot);
			let bit=(shot.x*2)&1;
			grid.drawShape(vlin[bit],shot.x,shot.y);
		} 
	}
	shots=result;
}

let status=["１ＵＰ"];
let delayMillis=20;
let layer=0;
let count=0;

let cursorX=0;
let cursorY=0;
let vidWidth=0;
let vidHeight=0;
let keyMask=-1;

while(isRunning()){
	const { columns, rows } = Deno.consoleSize();
	if(vidWidth!=columns-12||vidHeight!=rows-4){
		vidWidth=columns-12;
		vidHeight=rows-4;
		console.log(cursorClear);
	}

	let pany=cursorY>>2;
	let span=grid.span;
	let menuWide=mainMenu?5:0;
	let wide2=(vidWidth-menuWide)*2;

	grid.drawShape(["  "],shipx,shipy);
	grid.drawShape(["   "],shipx,shipy+1);
	shipx+=0.5*joyx;
	if (shipx>grid.width-2) shipx=grid.width-2;
	if (shipx<0) shipx=0;
	grid.drawShape(ship,shipx,shipy);

	let bit=(shipx*2)&1;
	grid.drawShape(vlin[bit],shipx,shipy+1);
	grid.drawShape(vlin[1-bit],shipx+1.5,shipy+1);

	updateShots();

	let blocks=grid.toStrings();
	console.log(cursorHome);
	console.log(gameTitle+" ["+columns+","+rows+"] count:"+count);
	let wall=(mainMenu)?menuWall(blocks):blocks.join("\n");
	console.log(wall);
	let latest=status.slice(-13);
	console.log(latest.join("\n"));
	let code=setCursor(5,7);
//	writeConsole(code);

	await sleep(delayMillis);

	const keys=pollKeyboard();
	joyx=0;
	if(keys&8) joyx=1;
	if(keys&4) joyx=-1;
	let mouse=pollMouse();
	if (keys&keyMask&16) pew();
	if (keys&64) stopRunning();
	keyMask=~keys;
}

const code1=setCursor(1,vidHeight+2);
//writeConsole(code1);
stopRunning();
closeMidi();
//await stopInput();
