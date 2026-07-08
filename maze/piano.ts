// piano.ts

import { sleep } from "./terminal.ts";
//import { startInput, pollInput, stopInput } from "./input.ts";
const ffiPath = Deno.build.os === "darwin"  ? "./macosffi.ts" : "./win32ffi.ts";
const { pollKeyboard, pollMouse, pollMidi, initMidi, closeMidi, writeMidi } =await import(ffiPath);

console.log("piano 0.1 - Space Backspace scratch, Esc to exit")

const debugging=false;
const logging=true;
const audition=false;

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


type Note = {duration: number;channel: number;note: number;};

const noteOns=new Map<number, Note>();

function updateNotes(millis:number):void{
//	console.log("updateNotes:",millis);
	for(let key:any of noteOns.keys()){
//		const noteChannel=Number(key);
		let note:Note=noteOns.get(key);
		note.duration-=millis;
		if((note.duration|0)<=0){
			noteOns.delete(key);
			if(hasMidi) writeMidi(NoteOff+note.channel,note.note,0);
			if(debugging) console.log("noteOff:",key)
		}
	}
}

function playNote(note:number=C4,volume:number=60,channel:number=0,duration:number=200):void{
	note&=127;
	volume&=127;
	channel&=15;
	const noteChannel:number=(channel<<7)|(note&127);
	noteOns.set(noteChannel,{duration,channel,note});
	if(hasMidi){
		if(noteChannel in noteOns){
			writeMidi(NoteOff+channel,note,0);
		}
		writeMidi(NoteOn+channel,note,volume);
	}
	if(logging){
		console.log("[PIANO] noteOn",{note,volume,channel,duration});
	}
}

function programChange(patch: number) {
	if(hasMidi){
		writeMidi(ProgramChange,patch,0);
	}
}


if(audition){
	//programChange(Patch.SynthBrass1);
	console.log("auditioning percussion");
	for (let i=26;i<128;i++){
		playNote(i,50,9);
		await sleep(12);
	}
	console.log("auditioning piano");
	for (let i=1;i<128;i++){
		playNote(128-i,40+i/20);
		await sleep(24);
	}
}

playNote(C4);

let midiCount=0;
let midiMessage=null;
let midiMillis=50;

function onMidi(status:number, data1:number, data2:number){
	midiMessage={status,data1,data2};
	if(status==176){
		if(data1==14){
			midiMillis=260-data2*2;

		}
	}
	midiCount++;	
}
// scratch 29 30 whistle 71 72 

let drums=29;
function onSpace(){
//    playNote(++drums,100,9);
	playNote(29,100,9);
}
function onBack(){
//    playNote(--drums,100,9);
	playNote(30,100,9);
}

let running=true;
let keyMask=-1;

while(running){
	const midiEvents = pollMidi();
	for (const event of midiEvents) {
		onMidi(event.status, event.data1, event.data2);
	}
	const keys=pollKeyboard()&keyMask;
	keyMask=~keys;
	if(keys&64) running=false;
	if(keys&16) onSpace();
	if(keys&32) onBack();
	updateNotes(midiMillis);
	await sleep(midiMillis);
}

closeMidi();
