// bitgrid.js
//  - width height layers of single bit pixels
//  - 32 bit data words contained in single Uint32Array
//	- drawShape stepConwayLife cellular automata functions incoming

export class BitGrid {

	constructor(width,height,layers) {
		this.span=0;
		this.width = width;
		this.height = height;
		this.layers = layers;
		this.span=(width+31)>>5;
		this.data=new Uint32Array(this.span*height*layers);
//		this.drawGrid(20,10,0);
	}

	drawShape(strings,x,y,layer){
		for(const text of strings){
			for(let i=0;i<text.length;i++){
				const char=text[i];
				const state=(char=="O");
				this.setPixel(x+i,y,layer,state);
			}
			y++;
		}
	}

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
		const w = this.width;
		const h = this.height;
		const pixels = new Array(w).fill(false);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const alive = this.getPixel(x, y, readLayer);
				const neighbors = this.countNeighbors(x, y, readLayer);
				const next = (alive && (neighbors === 2 || neighbors === 3)) || (!alive && neighbors === 3);
				pixels[x]=next;
//				if(neighbors) console.log("n:",neighbors);
			}
			this.writePixels(pixels, 0, y, writeLayer);
		}
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
};
