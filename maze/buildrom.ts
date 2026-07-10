// buildrom.ts
// loadtext

/*
                   * Memory map in a nutshell:                                                    *
                   *   $0000-01ff: RAM                                                            *
                   *   $0200-03ff: unused (MAME driver says RAM, but game doesn't use it)         *
                   *   $0400-07bf: playfield RAM                                                  *
                   *   $07c0-07cf: motion object picture                                          *
                   *   $07d0-07df: motion object vertical posn                                    *
                   *   $07e0-07ef: motion object horizontal position                              *
                   *   $07f0-07ff: motion object colors                                           *
                   *   $0800-2400: I/O ports (some write-only locations overlap with ROM)         *
                   *   $2000-3fff: game ROM (4x2KB)                                               *
                   *   (non-addressable): 2x2KB graphics ROM                                      *

*/

//const src="../research/centipede.asm";
//const orgStart=0x2000;
//const orgEnd=0x4000;

const src="../research/asteroids.txt";
const orgStart=0x6800;
const orgEnd=0x7000;

const text=await Deno.readTextFile(src);
let bulkCount=0;
let dropCount=0;
let blankCount=0;
//0e00: 00 00 00 00+ 

const ram=new Uint8Array(65536);
const lines=text.split("\n");
const n=lines.length;
let offset=0;
for(let i=0;i<n;i++){
	const line=lines[i].trim();
//	if(line.length>4&&line.substring(4,5)==":"){
	if(line.length>4&&line.charAt(4)==":"){
		const hex4=line.substring(0,4);
		offset=parseInt(hex4, 16);
		let j=5;
		let count=0;
		while(j<line.length-2){
			let char=line.charAt(j++);
			if(char=="+") {
//0df0: 00 00 00 00+                 .bulk   $00,$00,$00,$00,$18,$bc,$7f,$ef,$7e,$fd,$14,$a0,$00,$00,$00,$00
//				console.log(".bulk:",line);
				let k=line.indexOf(".bulk");
				if(k<0){
					dropCount++;
					break;
				}
				j=k+8;
				while(j<line.length-2){
					let pre=line.charAt(j);
					if(pre!="$") break;
					let hex2=line.substring(j+1,j+3);
					ram[offset++]=parseInt(hex2, 16);
					j+=4;
				}
				bulkCount++;
				break;
			}
			if(char!=" ") {
				dropCount++;
				break;
			}
			let hex2=line.substring(j+1,j+3);
			if (hex2=="  "){
				blankCount++;
				break;
			}
			ram[offset++]=parseInt(hex2, 16);
			count++;
			j+=2;
		}

	}
}
console.log({bulkCount,offset,dropCount,blankCount});
//for(let a=0x2000;a<0x3fff;a+=32){
for(let a=orgStart;a<orgEnd;a+=32){
	let code=[];
	for(let i=0;i<32;i++){
		code.push(ram[a+i].toString(16).padStart(2,"0"));
	}
	let a4=a.toString(16).padStart(4,"0");
	console.log(" \""+a4+":"+code.join("")+"\",");
}
