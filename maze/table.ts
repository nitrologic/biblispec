// table.ts

// surround truth with 8 bit edgeCase 

console.log("nitrologic biblispec table 0.1.8");

const borderStyle=["╭─╮│┼│╰─╯","┏━┓┃╋┃┗━┛","╔═╗║╬║╚═╝","↗→↘↑┼↓↖←↙","↙←↖↓┼↑↘→↗"];
const undefinedCase="▯";
const dot="·";

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

enum Edge {TopLeft, Top, TopRight, Left, Center, Right, BottomLeft, Bottom, BottomRight, T1, T2, T3, T4, H, V, Z}

const edgeCase={
	0b00100001:Edge.T1,
	0b10000100:Edge.T2,
	0b01000010:Edge.H,
	0b00011000:Edge.V,
	0b00000101:Edge.T3,
	0b10100000:Edge.T4,
	0b10100001:Edge.Center,
	0b10000101:Edge.Center,
	0b00100101:Edge.Center,
	0b10100100:Edge.Center,
	0b00000001:Edge.TopLeft,
	0b10000000:Edge.BottomRight,
	0b00100000:Edge.BottomLeft,
	0b00000100:Edge.TopRight,
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
	0b11110100:Edge.BottomRight,
	0b11101001:Edge.BottomLeft,
	0b10010000:Edge.Right, 
	0b00101000:Edge.Left,
	0b10010111:Edge.TopRight,
	0b00101111:Edge.TopLeft,
	0b10010011:Edge.TopRight,
	0b11001001:Edge.BottomLeft,
	0b00101110:Edge.TopLeft,
	0b01110100:Edge.BottomRight,
	0b00000010:Edge.Top,
	0b00001000:Edge.Left,
	0b00010000:Edge.Right,
	0b01000000:Edge.Bottom,
	0b00010010:Edge.V, // (top and bottom walls) → │
	0b01000100:Edge.Right, //  (left and right walls) → ─
	0b00010110:Edge.T1, //  (top, bottom, right walls) → ├
	0b01010010:Edge.T2, //  (top, bottom, left walls) → ┤
	0b00011100:Edge.T3, //  (top, left, right walls) → ┬
	0b01001100:Edge.T4, //  (bottom, left, right walls) → ┴
	0b01011100:Edge.Center, //  (all four cardinal walls) → ┼
	0b10100101:Edge.Center,
	0b10000001:Edge.Center,
	0b00100100:Edge.Center
}

export class BitGrid {
	width:number;
	height:number;
	layers:number;
	span:number;
	data:Uint32Array;
	heatmap:Uint16Array;

	constructor(width:number,height:number,layers:number) {
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
		const grid = new BitGrid(width*2+5, height*2+5, 2);
		for(let y=0;y<height;y++){
			const line=lines[y];
			for(let x=0;x<width;x++){
				if(line.charAt(x)==truth) {
					grid.setPixel(3+x*2,3+y*2,0,true);
				}
			}
		}
		return grid;
	}

	// bit pixel

	getPixel(x:number,y:number,layer:number){
		// x,y toroidal wrap around getter
		x = (x + this.width) % this.width;
		y = (y + this.height) % this.height;
		const offset = layer*this.height*this.span;
		const wordIndex = y*this.span+(x>>5);
		const bitIndex = x&31;
		const word=this.data[offset+wordIndex];
		return (word&(1<<bitIndex))!=0;
	}

	getNeighbors(x:number,y:number,z:number){
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

	setPixel(x:number,y:number,layer:number,state:boolean){
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

// grid stuff

	// heatmap methods

	cool(falloff){
		let index=0;
		for(let y=0;y<this.height;y++){
			for(let x=0;x<this.width;x++){
				this.heatmap[index++]*=falloff;
			}
		}
	}

	heat(layer,value){
		let offset=layer*this.height*this.span;
		let index=0;
		let word=0;
		for(let y=0;y<this.height;y++){
			for(let x=0;x<this.width;x++){
				if((x&31)==0){
					word=this.data[offset++];
				}
				const mask=1<<(x&31);
				if(word&mask) this.heatmap[index]+=value;
				index++;
			}
		}
	}

	drawMask(strings,maskChar,x,y,layer){
		for(const text of strings){
			for(let i=0;i<text.length;i++){
				const char=text[i];
				const state=(char==maskChar);//(char=="O");
				this.setPixel(x+i,y,layer,state);
			}
			y++;
		}
	}

	rect(x,y,width,height,layer=0){
		const offset=layer*this.height*this.span;
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				const wordIndex = row * this.span + (col >> 5);
				const bitIndex = col & 31;
				this.data[offset+wordIndex] |= (1 << bitIndex);
			}
		}    
	}

	drawGrid(skipx=20,skipy=10,layer=0){
		let w=this.width;
		let h=this.height;
		for(let x=0;x<w;x+=skipx){
			this.rect(x,2,1,h-2,layer);
		}
		this.rect(w-3,3,2,h-4,layer);
		for(let y=0;y<h;y+=skipy){
			this.rect(0,y,w,1,layer);
		}
		this.rect(3,h-3,w-4,2,layer);
	}

	writePixels(pixels,x,y,layer){
		let offset=layer*this.height*this.span+y*this.span+(x>>5);
		let word=this.data[offset];
		for(let i=0;i<pixels.length;i++){
			const mask=1<<(x&31);
			const state=pixels[i];
			if(state){
				word|=mask;
			}else{
				word&=~mask;
			}
			x++;
			if(i<pixels.length-1 && ((x&31)==0)){
				this.data[offset++]=word;
				word=this.data[offset];
			}
		}
		this.data[offset]=word
	}

	stepConwayLife(readLayer, writeLayer) {
		let entropy=0;
		const w = this.width;
		const h = this.height;
		const pixels = new Array(w);//.fill(false);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const alive = this.getPixel(x, y, readLayer);
				const neighbors = this.countNeighbors(x, y, readLayer);
				const next = (alive && (neighbors === 2 || neighbors === 3)) || (!alive && neighbors === 3);
				if(next!=alive) entropy++;
				pixels[x]=next;

			}
			this.writePixels(pixels, 0, y, writeLayer);
		}
		return entropy;
	}

	copyLayer(readLayer, writeLayer) {
		const wordsPerLayer = this.height * this.span;
		const readOffset = readLayer * wordsPerLayer;
		const writeOffset = writeLayer * wordsPerLayer;
		this.data.copyWithin(writeOffset, readOffset, readOffset + wordsPerLayer);
	}

	countNeighbors(x, y, layer) {
		let count=0;
		if (this.getPixel(x-1, y-1, layer)) count++;
		if (this.getPixel(x, y-1, layer)) count++;
		if (this.getPixel(x+1, y-1, layer)) count++;
		if (this.getPixel(x-1, y, layer)) count++;
		if (this.getPixel(x+1, y, layer)) count++;
		if (this.getPixel(x-1, y+1, layer)) count++;
		if (this.getPixel(x, y+1, layer)) count++;
		if (this.getPixel(x+1, y+1, layer)) count++;
		return count;
	}
}

// return bordered version of lines with char per cell spacing

const badBits:Array<number>=[];

function layout(left:string[],right:string[]){
	const result=[];
	const n=left.length;
	for(let i=0;i<n;i++){
		result.push(left[i]+right[i]);
	}
	return result.join("\n");
}

function makeTable(grid:BitGrid,z:number,borderStyle:string,emptyChar:string){
	const style=[...borderStyle];
	const result=[];
	for(let y=1;y<grid.height-1;y++){
		let line=""
		for(let x=1;x<grid.width-1;x++){
			if(!grid.getPixel(x,y,z)){
				let bits=grid.getNeighbors(x,y,z);
				let border=emptyChar;
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
				line+=" ";
			}
		}
		result.push(line);
	}
	return result;
}

// table example displaying with each borderStyle

const dumpAll=false;
const dumpLines=false;

const grid=BitGrid.fromLines(lines,"#");
if(dumpLines){
	console.log(lines.join("\n"));
}

if(dumpAll){
	for(const key in borderStyle){
		const borderChars=borderStyle[key]+"├┤┬┴─│"+"👺"
		const table=makeTable(grid,0,borderChars,dot);
		console.log(table.join("\n"));
	}
}

const borderBits=borderStyle[0]+"├┤┬┴─│"+"👺"
const table0=makeTable(grid,0,borderBits,dot);
console.log(table0.join("\n"));
const table1=makeTable(grid,1,borderBits,dot);
console.log(layout(table0,table1));

function bin(bits:number){return "0b"+bits.toString(2).padStart(8,"0");}
for(const bits of badBits){
	console.log("undefined",bin(bits,6),bits);
}


