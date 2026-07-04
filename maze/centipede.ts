// centipede.ts

import { writeConsole, setCursor, replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollInput } from "./terminal.ts";
import { CharGrid } from "./chargrid.js";

const grid = new CharGrid(30,25,4);

grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],0,0,0);
grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],1,1,0);
grid.drawShape(["🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄"],2,5,0);

let ship="🤖"
let shipx=15;
let shipy=20

let joyx=-1;

let mainMenu=false;
let cursorHome="\x1b[H";
let cursorClear="\x1b[2J\x1b[1;1H";

// 30x25
// 🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄

const gameTitle="☰ centipede 0.1 - arrows, space, q to quit";
console.log(cursorClear);
keyboardMouseTask()
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

    await sleep(delayMillis);
//    grid=updateGrid(grid,rules);
//    fadePumps();
//    scanGridKeyboard();
//    updateCursor();
}

const code1=setCursor(1,vidHeight+2);
writeConsole(code1);
stopRunning();
