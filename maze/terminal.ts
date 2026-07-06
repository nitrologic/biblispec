// terminal.ts - Text User Interface console operations

// traffic.ts and grid.ts import from here

// sleep, replaceText, isRunning, stopRunning

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function replaceText(text: string, search: string, replace: string, leftToRight:boolean=true) : string {
	if (leftToRight) return text.replaceAll(search, replace);
	const reversed = Array.from(text).reverse().join("");
	const revSearch = Array.from(search).reverse().join("");
	const revReplace = Array.from(replace).reverse().join("");
	const res = reversed.replaceAll(revSearch, revReplace);
	return Array.from(res).reverse().join("");
}



const resetConsole="\x1b[0m";
const enableCursor="\x1b[?25h";
const disableCursor="\x1b[?25l";
let blinkFrame=0;

export function setCursor(col: number,row: number): string {
	let code=`\x1b[${row};${col}H`;
	const blink=((blinkFrame++)&16)==0;
	code+=blink?enableCursor:disableCursor;
	return code;
}

const encoder=new TextEncoder();

export function writeConsole(text:string){
	Deno.stdout.write(encoder.encode(text));
}