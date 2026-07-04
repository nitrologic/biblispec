// centipede.ts

import { pollKeys, pollMouse } from "./ffi.ts";
import { writeConsole, setCursor, replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollInput } from "./terminal.ts";
import { CharGrid } from "./chargrid.js";

const cursorHome="\x1b[H";
const cursorClear="\x1b[2J\x1b[1;1H";

const grid = new CharGrid(30,25,4);

grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],0,0,0);
grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],1,1,0);
grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],2,5,0);

const gameTitle="☰ centipede 0.1 - arrows, space, q to quit";
console.log(cursorClear);

let ship="🤖"
let shipx=15;
let shipy=20

let joyx=-1;

let mainMenu=false;

function resetGame(){
}

function scanInput(){
	const queue:Uint8Array[]=pollInput();
	for(let input of queue){       
//      console.log("input:",input);
		const n=input.length;
		let key=input[0];
		if(key==27) {
			if(n==1){
				resetGame();
				continue;
			}
			if(n>1 && input[1]==91){
				const keycode=input[2];
				const up=keycode==65;
				const down=keycode==66;
				const right=keycode==67;
				const left=keycode==68;
			}
		}
	}
}

// 30x25
// 🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄


let status=["Score : 0"];
let delayMillis=66;
let layer=0;
let count=0;

let cursorX=0;
let cursorY=0;
let vidWidth=0;
let vidHeight=0;

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

	grid.drawShape(["  "],shipx,shipy,0);
	shipx+=joyx;
	if (shipx>grid.width-2) shipx=0;//grid.width-1;
	if (shipx<0) shipx=grid.width-2;
	grid.drawShape(ship,shipx,shipy,0);

//	let blocks=gridBlockWindowLayer(bitgrid,0,cursorX,pany,wide2/2,vidHeight);
//	let blocks=gridQuadWindowLayer(bitgrid,0,cursorX,pany,wide2,vidHeight*2);
//    let blocks=gridQuadWindow(bitgrid,[0,2,3],cursorX,pany,wide2,vidHeight*2);

	let blocks=grid.toStrings();

	console.log(cursorHome);
	console.log(gameTitle+" ["+columns+","+rows+"] count:"+count);

	let wall=(mainMenu)?menuWall(blocks):blocks.join("\n");
	console.log(wall);
	let latest=status.slice(-13);
	console.log(latest.join("\n"));
	let code=setCursor(5,7);
	writeConsole(code);

	let keys=pollKeys();
	joyx=0;
	if(keys&8) joyx=1;
	if(keys&4) joyx=-1;

	let mouse=pollMouse();
	
	let fire=(keys&16);

	if(keys&32) stopRunning();

	await sleep(delayMillis);
//    grid=updateGrid(grid,rules);
//    fadePumps();
//	scanInput();
//    updateCursor();
}

const code1=setCursor(1,vidHeight+2);
writeConsole(code1);
stopRunning();
