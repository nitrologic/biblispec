// traffic.ts

import { replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollInput } from "./terminal.ts";

const ffiPath = Deno.build.os === "darwin"  ? "./macosffi.ts" : "./win32ffi.ts";
const { pollKeyboard, pollMouse, initMidi, pollMidi, closeMidi, writeMidi } =await import(ffiPath);

const hasMidi=initMidi();

const ProgramChange = 0xC0;
const NoteOn=0x90;
const NoteOff=0x80;
const C4=60;

const Patch = {
	AcousticGrandPiano: 0,
	BrightAcousticPiano: 1,
	ElectricPiano1: 4,
	Harpsichord: 6,
	AcousticGuitar: 24,
	Violin: 40,
	Trumpet: 56,
	AltoSax: 65,
	Flute: 73,
	LeadSquare: 80,
	SynthBrass1 :62
};


console.log("traffic 0.6 - Space to instance, Esc to quit")

const noteOns={};

function programChange(patch: number) {
	if(hasMidi){
		writeMidi(ProgramChange,patch,0);
	}
}

function playNote(note:number=C4,volume:number=60,channel:number=0,millis:number=200):void{
	note&=127;
	volume&=127;
	channel&=15;
	if(hasMidi){
		const noteChannel=(channel<<7)|(note&127);
		if(noteChannel in noteOns){
			writeMidi(NoteOff+channel,note,0);
		}
		noteOns[noteChannel]={millis,channel,note};
		writeMidi(NoteOn+channel,note,volume);
	}
}

function updateNotes(millis:number):void{
	if(hasMidi){
		for(let key in noteOns){
			const note=noteOns[key];
			note.millis-=millis;
			if((note.millis|0)<=0){
				writeMidi(NoteOff+note.channel,note.note,0);
				delete noteOns[key];
			}
		}
	}
}

//programChange(Patch.SynthBrass1);
console.log("auditioning percussion");
for (let i=1;i<128;i++){
	playNote(i,50,9);
	await sleep(32);
}
console.log("auditioning piano");
for (let i=1;i<128;i++){
	playNote(128-i,40+i/20);
	await sleep(24);
}
playNote(C4);

let trafficSleep=20;//10;//60;
let trafficWidth=72;

let rules={
	"▤▢▢▢▢▢":"▥▢▣▣▣▢",
	"▣▣▣▦▢":"▢▢▢▦▣",
	"▣▣▣▦▣":"▢▢▢▦▣",
	"▢▣▣▣▢":"▢▢▣▣▣"
}

let emit={
	"▥▢▢▢▢▢":"▤▢▢▢▢▢"
}

const encoder=new TextEncoder();
let defaultLane="▤"+"▢".repeat(trafficWidth)+"▦▢";

const cursorUp="\x1b[A";
const cursorErase="\x1b[K";

let lane:string=defaultLane;

function updateLane(lane:string,map:any){
	for(let key in map){
		let value=map[key];
		lane=replaceText(lane,key,value,false);
	}
	return lane;
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

export function scanTrafficKeyboard(){
	let queue:Uint8Array[]=pollInput();
	for(let index=0;index<queue.length;index++){
		let keys=queue[index];
		if(keys[0]==32) {
			lane=updateLane(lane,emit);
		}
		if(keys[0]==27) {
			if(keys.length==1) lane=defaultLane;
			let up=(keys.length>2) && ((keys[1]==91)&&(keys[2]==65));
			let down=(keys.length>2) && ((keys[1]==91)&&(keys[2]==66));
			let right=(keys.length>2) && ((keys[1]==91)&&(keys[2]==67));
			let left=(keys.length>2) && ((keys[1]==91)&&(keys[2]==68));
			if(up) pump[axis.UP]+=200;
			if(down) pump[axis.DOWN]+=200;
			if(right) pump[axis.RIGHT]+=200;
			if(left) pump[axis.LEFT]+=200;
		}
	}
}

//keyboardMouseTask()

let keyMask=-1;
let keyNote=C4;

while(isRunning()){
	console.log(lane,pump,cursorErase);
	Deno.stdout.write(encoder.encode(cursorUp));
	await sleep(trafficSleep);
	lane=updateLane(lane,rules);
	fadePumps();
//	scanTrafficKeyboard();
	let keyBits=pollKeyboard();
	let hit=keyBits&keyMask;
	keyMask=~keyBits;
	if(hit&64) stopRunning();
	if(hit&16){
		lane=updateLane(lane,emit);
		playNote(keyNote--);
	}
	updateNotes(trafficSleep);

}

stopRunning();
console.log("traffic stopped");

closeMidi();
