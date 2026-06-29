console.log("maze 0.2");

const plain=[
	"#################################",
	"#                               #",
	"# ######                        #",
	"#                    #          #",
	"#                    #          #",
	"#################################",
]

const block="▢▣"
const boxRounded="╭╮╰╯─┬┴│┤├┼";
const boxDouble="╔╗╚╝═╦╩║╣╠╬";
const boxSingle="┏┓┗┛━┳┻┃┫┣╋";

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

function tripleLines(lines:string[],x:number,y:number){
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

function clampSample33(lines:string[],x:number,y:number){
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

function wrapSample33(lines:string[],x:number,y:number){
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
	let height=lines.length*2+1;
	let width=lines[0].length*2+1;
	let frame=[];
	for(let y=0;y<height;y++){
		let line="";
		for(let x=0;x<width;x++){
			let block="▢ ";
			if(y>0 && y<height-1 && x>0 && x<width-1){
				if(y>0 && y<height-1 && x>0 && x<width-1){
					let col=((x-1)/2)|0;
					let row=((y-1)/2)|0;
					if(col<w && row <h){
						let a9=wrapSample33(lines,col,row);
//						let a9=clampSample33(lines,col,row);
						if(a9.includes(35))	block="▣ ";
//						if(!a9.includes(32))	block="▣ ";
					}
				}
			}
			line+=block;
		}
	   	frame.push(line);
	}
	return frame;
}

let double=doubleLines(plain);
let triple=tripleLines(plain);

for(let line of triple){
	console.log(line);
}

let grid=blockHashGrid(triple)

for(let line of grid){
	console.log(line);
}
