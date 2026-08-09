// tabletop.ts

// return bordered version of lines with char per cell spacing

import { edgeCase, BitGrid } from "./table.ts";

console.log("nitrologic biblispec tabletop 0.2.0");

const pie="◐◒◑◓◔◕◉◎◍❂";
const borderStyle=["╭─╮│┼│╰─╯","┏━┓┃╋┃┗━┛","╔═╗║╬║╚═╝","↗→↘↑┼↓↖←↙","↙←↖↓┼↑↘→↗"];
const undefinedCase="▯";
const blankCase="·";;
const dot="●";
const hollow="○";
const fishEmoji="▪▫◦·";//"𓆛𓆜𓆝𓆞𓆟";

const lines=[
	"#**####################",
	"#             # #     #",
	"# ###### ######## #   #",
	"# #    # #       ##   #",
	"#  # #       #        #",
	"# #    ###   #   ##   #",
	"##### #  ###     ## ###",
	"#     #           #   #",
	"#######################",
]

const badBits:Array<number>=[];

function layout(left:string[],right:string[]){
	const result=[];
	const n=left.length;
	for(let i=0;i<n;i++){
		result.push(left[i]+right[i]);
	}
	return result.join("\n");
}

function makeTable(grid:BitGrid,z:number,borderStyle:string,filler:string){
	const style=[...borderStyle];
	const fill=[...filler];
	const result=[];
	for(let y=1;y<grid.height-1;y++){
		let line=""
		for(let x=1;x<grid.width-1;x++){
			if(!grid.getPixel(x,y,z)){
				let bits=grid.getNeighbors(x,y,z);
//				let border=emptyChar;
				let border=fill[0];
				if(bits){
					if(bits in edgeCase){
						const edge=edgeCase[bits];
						border=style[edge];//borderStyle.charAt(edge);
					}else{
						border=undefinedCase;//"·";//"▢";						
						badBits.push(bits);
					}
				}
				line+=border;
			}else{
				line+=blankCase;
			}
		}
		result.push(line);
	}
	return result;
}

// table example displaying with each borderStyle

const dumpAll=false;
const dumpLines=false;

if(dumpLines){
	console.log(lines.join("\n"));
}

const grid=BitGrid.fromLines(lines,"#");

grid.copyLayer(0,1);

if(dumpAll){
	for(const key in borderStyle){
		const borderChars=borderStyle[key]+"├┤┬┴─│"+"👺"
		const table=makeTable(grid,0,borderChars,dot);
		console.log(table.join("\n"));
	}
}

const borderBits=borderStyle[0]+"├┤┬┴─│"+"👺"
const table0=makeTable(grid,0,borderBits,hollow);
//console.log(table0.join("\n"));
const table1=makeTable(grid,1,borderBits,dot);
console.log(layout(table0,table1));

function bin(bits:number){return "0b"+bits.toString(2).padStart(8,"0");}
for(const bits of badBits){
	console.log("undefined",bin(bits,6),bits);
}
