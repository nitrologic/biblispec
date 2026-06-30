// maze.ts 

// biblispec books maze example script by nitrologic

console.log("maze 0.9");

const starChar="✩";
const hashChar="⬦";//"◦";
const grass7="◆◇◈⬥⬦⬡⬢";
const pointChars="◯⊙⊚⦾⦿◉◎◍❂○●◦◌";
const miscChars="⧀⧁⧂⧃⧄⧅⧆⧇⧈⧉";
const flowerChars="✻✼✽✾✿❀❁";
const grassWide7="✻✾✿✼✽❀❁";

const plain=[
	"#######################",
	"#             # #     #",
	"# ###### ######## #   #",
	"# #    # #       ##   #",
	"#  # #       #        #",
	"#######################",
]

function swizzle(text:string):string{
	let chars=[...text];
	let n=text.length;
	let p0=0;
	for(let i=0;i<n*2;i++){
		let p1=p0;
		p0=(Math.random()*n)|0;
		let temp=chars[p0];chars[p0]=chars[p1];chars[p1]=temp;
	}
	return chars.join('');
}
function draw(line,range7){
	let ascii=line.replaceAll("▣",hashChar).replaceAll("▢"," ");
//	console.log(ascii);

	let bed16=hashChar.repeat(16);
	let bed16b=hashChar+swizzle(range7+range7)+hashChar;
	let shrubs=ascii.replaceAll(bed16,bed16b);

	let bed9=hashChar.repeat(9);
	let bed9b=hashChar+swizzle(range7)+hashChar;
	let herbs=shrubs.replaceAll(bed9,bed9b);

	let bed4=hashChar.repeat(4);
	let bed4b=hashChar+swizzle(range7.substring(0,2))+hashChar
	herbs=herbs.replaceAll(bed4,bed4b);

	let bed3=hashChar.repeat(3);
	let bed3b=hashChar+range7.substring(0,1)+hashChar
	herbs=herbs.replaceAll(bed3,bed3b);


	console.log(herbs);
}

function tile(b9){
	return b9.substring(0,3)+"\n"+b9.substring(3,6)+"\n"+b9.substring(6,9)+"\n\n";	// +" "+b9+
}

const halfs=" ▀▄█";
const quads=" ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█";
const steps=" ▂▃▄▅▆▇█";

const block="▢▣"

const boxRounded="╭╮╰╯│─┬┴│┤├┼";
const boxDouble="╔╗╚╝║═╦╩║╣╠╬";
const boxSingle="┏┓┗┛┃━┳┻┃┫┣╋";

let boxMode=boxRounded;

enum Edge2 { CornerTopLeft, CornerTopRight, CornerBotLeft, CornerBotRight, LineHoriz, TeeDown, TeeUp, LineVert, TeeLeft, TeeRight, Cross }
enum Edge { CornerTopLeft, CornerTopRight, CornerBotLeft, CornerBotRight, LineVert, LineHoriz }

// if 3x3 has single solid corner then use an edge corner 

function boxIndex(b9:string):number{
	if(b9=="▢▢▢▢▢▢▢▢▣") return Edge.CornerTopLeft;
	if(b9=="▣▢▢▢▢▢▢▢▢") return Edge.CornerBotRight;
	if(b9=="▢▢▣▢▢▢▢▢▢") return Edge.CornerBotLeft;
	if(b9=="▢▢▢▢▢▢▣▢▢") return Edge.CornerTopRight;
	if(b9=="▣▣▣▢▢▢▢▢▢") return Edge.LineHoriz;
	if(b9=="▢▢▢▢▢▢▣▣▣") return Edge.LineHoriz;
	if(b9=="▣▣▢▢▢▢▢▢▢") return Edge.LineHoriz;
	if(b9=="▢▢▢▢▢▢▣▣▢") return Edge.LineHoriz;
	if(b9=="▢▣▣▢▢▢▢▢▢") return Edge.LineHoriz;
	if(b9=="▢▢▢▢▢▢▢▣▣") return Edge.LineHoriz;
	if(b9=="▣▢▢▣▢▢▣▢▢") return Edge.LineVert;
	if(b9=="▢▢▣▢▢▣▢▢▣") return Edge.LineVert;
	if(b9=="▢▢▢▢▢▣▢▢▣" || b9=="▢▢▢▣▢▢▣▢▢") return Edge.LineVert;
	if(b9=="▣▣▣▣▢▢▣▢▢") return Edge.CornerTopLeft;
	if(b9=="▣▣▣▢▢▣▢▢▣") return Edge.CornerTopRight;
	if(b9=="▣▢▢▣▢▢▢▢▢" || b9=="▢▢▣▢▢▣▢▢▢") return Edge.LineVert;
	if(b9=="▣▢▢▣▢▢▣▣▣") return Edge.CornerBotLeft;
	if(b9=="▢▢▣▢▢▣▣▣▣") return Edge.CornerBotRight;
	if(b9=="▣▢▢▣▢▢▢▣▣") return Edge.CornerBotLeft;
	if(b9=="▣▣▢▢▢▣▢▢▣") return Edge.CornerTopRight;
	console.log(tile(b9));
	return -1;
}

function getOutline(u: boolean, d: boolean, l: boolean, r: boolean): Edge {
	if (u && d && l && r) return Edge.Cross;
	if (u && d && l) return Edge.TeeLeft;
	if (u && d && r) return Edge.TeeRight;
	if (u && l && r) return Edge.TeeUp;
	if (d && l && r) return Edge.TeeDown;
	if (l && r) return Edge.LineHoriz;
	if (u && d) return Edge.LineVert;
	if (d) return r ? Edge.CornerTopLeft : Edge.CornerTopRight;
	return r ?Edge.CornerBotLeft : Edge.CornerBotRight;
}

function getEdge(u: boolean, d: boolean, l: boolean, r: boolean): Edge {
	if (u && d && l && r) return Edge.Cross;
	if (u && d && l) return Edge.TeeLeft;
	if (u && d && r) return Edge.TeeRight;
	if (u && l && r) return Edge.TeeUp;
	if (d && l && r) return Edge.TeeDown;
	if (l && r) return Edge.LineHoriz;
	if (u && d) return Edge.LineVert;
	if (d) return r ? Edge.CornerTopLeft : Edge.CornerTopRight;
	return r ?Edge.CornerBotLeft : Edge.CornerBotRight;
}

function udlr(a9):number{
	let u = a9[1]===9635;
	let d = a9[7]===9635;
	let l = a9[3]===9635;
	let r = a9[5]===9635;
	if (u || d || l || r) {
		let index=getEdge(u, d, l, r);
		return index;
	} else {
		return -1;
	}
}

function outlineGrid(lines:string[],boxChars:string){
	let w=lines[0].length;
	let h=lines.length;
	let result=[];
	for(let y=0;y<h;y++){
		let line="";
		for(let x=0;x<w;x++){
			let char=lines[y].charAt(x);
//			let a9:number[]=clampSample33(lines,x,y);
			let a9:number[]=wrapSample33(lines,x,y);
			if(a9.length!=9){
				console.log("Error with a9");
			}
			if(char=="▢"&&a9.includes(9635)){//&&a9.includes(9634)){
//				let index=udlr(a9);
				let b9=String.fromCodePoint(...a9);
				let index=boxIndex(b9);
				if(index<0){
					console.log("\""+b9+"\"");					
				}
				if(index>=0) char=boxChars.charAt(index);else char=starChar;
			}
			line+=char;
		}
		result.push(line);
	}
	return result;
}


function wideLines(lines:string[],x:number,y:number){
	let w=lines[0].length;
	let h=lines.length;
	let result=[];
	for(let line of lines){
		let text="";
		for(let char of line){
			text+=char+char;
		}
		result.push(text);
	}
	return result;
}

function doubleLines(lines:string[],x:number,y:number){
	let w=lines[0].length;
	let h=lines.length;
	let result=[];
	for(let line of lines){
		let text="";
		for(let char of line){
			text+=char+char;
		}
		result.push(text,text);
	}
	return result;
}

function tripleLines(lines:string[],x:number,y:number):string[]{
	let w=lines[0].length;
	let h=lines.length;
	let result=[];
	for(let line of lines){
		let text="";
		for(let char of line){
			text+=char+char+char;
		}
		result.push(text,text,text);
	}
	return result;
}

function clampSample33(lines:string[],x:number,y:number):number[]{
	let w=lines[0].length;
	let h=lines.length;
	let result=[];
	if(y>0)	result.push((x>0)?(lines[y-1].codePointAt(x-1)):0,
		lines[y-1].codePointAt(x),
		(x<w)?lines[y-1].codePointAt(x+1):0);
	else result.push(0,0,0);
	result.push(
		(x>0)?(lines[y].codePointAt(x-1)):0,
		lines[y].codePointAt(x),
		(x<w)?lines[y].codePointAt(x+1):0
	);
	if(y<h-1) result.push((x>0)?(lines[y+1].codePointAt(x-1)):0,
		lines[y+1].codePointAt(x),
		(x<w)?lines[y+1].codePointAt(x+1):0);
	else result.push(0,0,0);
	return result;
}

function wrapSample33(lines:string[],x:number,y:number):number[]{
	let w=lines[0].length;
	let h=lines.length;
	try{
		return [
			lines[(h+y-1)%h].codePointAt((w+x-1)%w),
			lines[(h+y-1)%h].codePointAt((w+x)%w),
			lines[(h+y-1)%h].codePointAt((w+x+1)%w),
			lines[(h+y)%h].codePointAt((w+x-1)%w),
			lines[(h+y)%h].codePointAt((w+x)%w),
			lines[(h+y)%h].codePointAt((w+x+1)%w),
			lines[(h+y+1)%h].codePointAt((w+x-1)%w),
			lines[(h+y+1)%h].codePointAt((w+x)%w),
			lines[(h+y+1)%h].codePointAt((w+x+1)%w),
		]
	}catch(err){
		console.log("wrapSample33 error ",x,y);
		return [];
	}
}

// insert framing between all blocks in h and v

// return 2 x codepoint 35 is #

function blockHashGrid(lines:string[]){
	let w=lines[0].length;
	let h=lines.length;
	let height=lines.length*2+2;
	let width=lines[0].length*2+2;
	let frame=[];
	for(let y=0;y<height;y++){
		let line="";
		for(let x=0;x<width;x++){
			let block="▢";
			if(y>0 && y<height-1 && x>0 && x<width-1){
				if(y>0 && y<height-1 && x>0 && x<width-1){
					let col=((x-1)/2)|0;
					let row=((y-1)/2)|0;
					if(col<w && row<h){
//						let a9=wrapSample33(lines,col,row);
						let a9=clampSample33(lines,col,row);
						if(a9[4]==35) block="▣";
//						if(a9.includes(35))	block="▣ ";
//						if(!a9.includes(32)) block="▣ ";
					}
				}
			}
			line+=block;
		}
	   	frame.push(line);
	}
	return frame;
}

let wide=wideLines(plain);
let double=doubleLines(plain);
let triple=tripleLines(plain);
let src=wide;
for(let line of src){
	console.log(line);
}
let grid=blockHashGrid(src)
let grid2=outlineGrid(grid,boxMode);
for(let line of grid2){
	draw(line,grass7);
}
