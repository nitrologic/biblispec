// table.ts

console.log("nitrologic table 0.2");

export class BitGrid {

	constructor(width,height,layers) {
		this.width = width;
		this.height = height;
		this.layers = layers;
		this.span=(width+31)>>5;
		this.data=new Uint32Array(this.span*height*layers);
		this.heatmap=new Uint16Array(width*height);
	}

	static fromLines(lines: string[], truth: string): BitGrid {
		const height = lines.length;
		const width = lines[0].length;
		const grid = new BitGrid(width+2, height+2, 1);
		for(let y=0;y<height;y++){
			const line=lines[y];
			for(let x=0;x<width;x++){
				if(line.charAt(x)==truth) {
					grid.setPixel(x+1,y+1,0,true);
				}
			}
		}
		return grid;
	}

	// bit pixel

	getPixel(x,y,layer){
		// x,y toroidal wrap around getter
		x = (x + this.width) % this.width;
		y = (y + this.height) % this.height;
		const offset = layer*this.height*this.span;
		const wordIndex = y*this.span+(x>>5);
		const bitIndex = x&31;
		const word=this.data[offset+wordIndex];
		return (word&(1<<bitIndex))!=0;
	}

	getNeighbors(x,y){
		let bits=0;
		if(this.getPixel(x-1,y-1)) bits|=128;
		if(this.getPixel(x,y-1)) bits|=64;
		if(this.getPixel(x+1,y-1)) bits|=32;
		if(this.getPixel(x-1,y)) bits|=16;
		if(this.getPixel(x+1,y)) bits|=8;
		if(this.getPixel(x-1,y+1)) bits|=4;
		if(this.getPixel(x,y+1)) bits|=2;
		if(this.getPixel(x+1,y+1)) bits|=1;
		return bits;
	}

	setPixel(x,y,layer,state){
		const offset=layer*this.height*this.span+y*this.span+(x>>5);
		const mask=1<<(x&31);
		let word=this.data[offset];
		if(state){
			word|=mask;
		}else{
			word&=~mask;
		}
		this.data[offset]=word
	}
}

const borderStyle=[
	"╭─╮│┼│╰─╯",
	"┏━┓┃╋┃┗━┛",
	"╔═╗║╬║╚═╝",
	"↗→↘↑┼↓↖←↙",
	"↙←↖↓┼↑↘→↗",
];

enum Edge { 
	CornerTopLeft, Top, CornerTopRight, 
	Left, Center, Right,
	CornerBottomLeft, Bottom, CornerBottomRight 
}

// 8surroungingbits:number,borderCharIndex:number,

const edgeCase={
	0b00000001:Edge.CornerTopLeft,
	0b10000000:Edge.CornerBottomRight,
	0b00100000:Edge.CornerBottomLeft,
	0b00000100:Edge.CornerTopRight


}

function boxIndex(b9:string):number{
	if(b9=="▢▢▢▢▢▢▢▢▣") return Edge.CornerTopLeft;
	if(b9=="▣▢▢▢▢▢▢▢▢") return Edge.CornerBottomRight;
	if(b9=="▢▢▣▢▢▢▢▢▢") return Edge.CornerBottomLeft;
	if(b9=="▢▢▢▢▢▢▣▢▢") return Edge.CornerTopRight;
	if(b9=="▣▣▣▢▢▢▢▢▢") return Edge.Bottom;
	if(b9=="▢▢▢▢▢▢▣▣▣") return Edge.Top;
	if(b9=="▣▣▢▢▢▢▢▢▢") return Edge.Bottom;
	if(b9=="▢▢▢▢▢▢▣▣▢") return Edge.Top;
	if(b9=="▢▣▣▢▢▢▢▢▢") return Edge.Bottom;
	if(b9=="▢▢▢▢▢▢▢▣▣") return Edge.Top;
	if(b9=="▣▢▢▣▢▢▣▢▢") return Edge.Right;
	if(b9=="▢▢▣▢▢▣▢▢▣") return Edge.Left;
	if(b9=="▢▢▢▢▢▣▢▢▣") return Edge.Left;
	if(b9=="▢▢▢▣▢▢▣▢▢") return Edge.Right;
	if(b9=="▣▣▣▣▢▢▣▢▢") return Edge.CornerBottomRight;
	if(b9=="▣▣▣▢▢▣▢▢▣") return Edge.CornerBottomLeft;
	if(b9=="▣▢▢▣▢▢▢▢▢") return Edge.Right; 
	if(b9=="▢▢▣▢▢▣▢▢▢") return Edge.Left;
	if(b9=="▣▢▢▣▢▢▣▣▣") return Edge.CornerTopRight;
	if(b9=="▢▢▣▢▢▣▣▣▣") return Edge.CornerTopLeft;
	if(b9=="▣▢▢▣▢▢▢▣▣") return Edge.CornerTopRight;
	if(b9=="▣▣▢▢▢▣▢▢▣") return Edge.CornerBottomLeft;
	if(b9=="▢▢▣▢▢▣▣▣▢") return Edge.CornerTopLeft;
	if(b9=="▢▣▣▣▢▢▣▢▢") return Edge.CornerBottomRight;
	console.log(tile(b9));
	return -1;
}

// return bordered version of lines with char per cell spacing

function makeTable(grid:BiitGrid,border:string){
	const result=[];
	for(let y=1;y<grid.height-1;y++){
		let line=""
		for(let x=1;x<grid.width-1;x++){
			if(!grid.getPixel(x,y)){
				let bits=grid.getNeighbors()
				let edge=(bits in edgeCase)?edgeCase[bits]:Edge.Center;
				line+=border.charAt(edge);
			}else{
				line+="*";
			}
		}
		result.push(line);
	}
	return result;
}

const lines=[
	"#**####################",
	"#             # #     #",
	"# ###### ######## #   #",
	"# #    # #       ##   #",
	"#  # #       #        #",
	"# #    ###   #   ##   #",
	"##### #  ###     ## ###",
	"#     #      #    #   #",
	"#     #           #   #",
	"#######################",
]

const grid=BitGrid.fromLines(lines,"#");
const table=makeTable(grid,borderStyle[0])

console.log(table.join("\n"));
