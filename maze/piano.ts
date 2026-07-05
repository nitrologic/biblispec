// piano.ts

const ffiPath = Deno.build.os === "darwin"  ? "./macosffi.ts" : "./win32ffi.ts";
const { pollKeyboard, pollMouse, initMidi, pollMidi, closeMidi, writeMidi } =await import(ffiPath);

import { writeConsole, setCursor, replaceText, sleep, isRunning, stopRunning, keyboardMouseTask, pollInput } from "./terminal.ts";


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
for (let i=26;i<128;i++){
    playNote(i,50,9);
    await sleep(32);
}
console.log("auditioning piano");
for (let i=1;i<128;i++){
    playNote(128-i,40+i/20);
    await sleep(24);
}
playNote(C4);

console.log("closing in 2...");
await sleep(2e3);
closeMidi();
