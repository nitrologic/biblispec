// table.ts

// renders path borders, not wall edges

console.log("nitrologic table 0.2");
const middleDot="·";
const gridBlocks=" ▣▥▤▦▢";

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
	0b00000100:Edge.CornerTopRight,
	0b11100000:Edge.Bottom,
	0b00000111:Edge.Top,
	0b11000000:Edge.Bottom,
	0b00000110:Edge.Top,
	0b01100000:Edge.Bottom,
	0b00000011:Edge.Top,
	0b10010100:Edge.Right,
	0b00101001:Edge.Left,
	0b00001001:Edge.Left,
	0b00010100:Edge.Right,
	0b11110100:Edge.CornerBottomRight,
	0b11101001:Edge.CornerBottomLeft,
	0b10010000:Edge.Right, 
	0b00101000:Edge.Left,
	0b10010111:Edge.CornerTopRight,
	0b00101111:Edge.CornerTopLeft,
	0b10010011:Edge.CornerTopRight,
	0b11001001:Edge.CornerBottomLeft,
	0b00101110:Edge.CornerTopLeft,
	0b01110100:Edge.CornerBottomRight,
	0b00000010:Edge.Top,
	0b00001000:Edge.Left,
	0b00010000:Edge.Right,
	0b01000000:Edge.Bottom,
	0b11100000:Edge.Left,
	0b00010010:Edge.Up, // (top and bottom walls) → │
	0b01000100:Edge.Right, //  (left and right walls) → ─
	0b00010110:Edge.T1, //  (top, bottom, right walls) → ├
	0b01010010:Edge.T2, //  (top, bottom, left walls) → ┤
	0b00011100:Edge.T3, //  (top, left, right walls) → ┬
	0b01001100:Edge.T4, //  (bottom, left, right walls) → ┴
	0b01011100:Edge.Center, //  (all four cardinal walls) → ┼

}


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
		const grid = new BitGrid(width*2+4, height*2+4, 1);
		for(let y=0;y<height;y++){
			const line=lines[y];
			for(let x=0;x<width;x++){
				if(line.charAt(x)==truth) {
					grid.setPixel(2+x*2,2+y*2,0,true);
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

	getNeighbors(x,y,z){
		let bits=0;
		if(this.getPixel(x-1,y-1,z)) bits|=128;
		if(this.getPixel(x,y-1,z)) bits|=64;
		if(this.getPixel(x+1,y-1,z)) bits|=32;
		if(this.getPixel(x-1,y,z)) bits|=16;
		if(this.getPixel(x+1,y,z)) bits|=8;
		if(this.getPixel(x-1,y+1,z)) bits|=4;
		if(this.getPixel(x,y+1,z)) bits|=2;
		if(this.getPixel(x+1,y+1,z)) bits|=1;
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

// return bordered version of lines with char per cell spacing

function makeTable(grid:BiitGrid,borderStyle:string){
	const result=[];
	for(let y=1;y<grid.height-1;y++){
		let line=""
		for(let x=1;x<grid.width-1;x++){
			if(!grid.getPixel(x,y,0)){
				let bits=grid.getNeighbors(x,y,0);
				let border="▢";
				if(bits in edgeCase){
					const edge=edgeCase[bits];
					border=borderStyle.charAt(edge);
				}
				line+=border;
			}else{
				line+="▣";
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
	"#     #           #   #",
	"#######################",
]

const grid=BitGrid.fromLines(lines,"#");
const table=makeTable(grid,borderStyle[3])

console.log(table.join("\n"));
