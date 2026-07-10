// paint.ts
// (C) 2026 nitrologic
// All Rights Reserved

import "./bitgrid.js";

import { sleep, pollInput, isRunning, stopRunning, writeConsole, setCursor, replaceText  } from "./terminal.ts";

import { BitGrid } from "./table.ts";

const paintTitle="☰ paint 0.1 - Arrows Space Q to quit";
const paintMillis=20;

// input

function pollKeyboard(){
    let queue:Uint8Array[]=pollInput();
    for(let index=0;index<queue.length;index++){
        let keys=queue[index];
        const rawKey=keys[0];
        switch(rawKey){
            case 32:
                // onSpace
                break;
            case 27:
                // onEscape
                stopRunning();
                break;
        }
    }    
}


// console size

const cursorHome="\x1b[H";
const cursorClear="\x1b[2J\x1b[1;1H";

let appWidth=0;
let appHeight=0;

let grid=new BitGrid(256,256,4);

function pollSize(){
	const { columns, rows } = Deno.consoleSize();
	const vidWidth=columns-6;
	const vidHeight=rows-6;
	if(vidWidth!=appWidth||vidHeight!=appHeight){
		appWidth=vidWidth;
		appHeight=vidHeight;
		console.log(cursorClear+paintTitle,[appWidth,appHeight]);
	}
}

// console mouse


// paint brush

let brushX=15;
let brushY=20;
let mainMenu=false;

function resetPaint(){
}

// shot  - canvas sprite resets background when moved

interface shot {cycles:number;x:number;y:number;}

let shots:Array<shot>=[];
let shotTotal=0;

function pew(){
    shotTotal++;
    shots.push({cycles:24,x:brushX,y:brushY});
}

function updateShots(){
    const result:Array<shot>=[];
    for(const shot of shots){
//        grid.drawShape(" ",shot.x,shot.y);
        shot.y--;
        if(shot.cycles-->0){
            result.push(shot);
            let bit=(shot.x*2)&1;
//          grid.drawShape(vlin[bit],shot.x,shot.y);
        } 
    }
    shots=result;
}

// quads

const gridQuads=" ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█";

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

// paint app

while(isRunning()){
    pollSize();
    updateShots();
    pollKeyboard();
    await sleep(paintMillis);
}

stopRunning();
