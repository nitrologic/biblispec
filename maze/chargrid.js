// chargrid.js

// width height layers of data - a flat charcode per pixel number array

export class CharGrid {

	constructor(width,height,layers) {
		this.width = width;
		this.height = height;
		this.layers = layers;
		this.span=(width);
		const count=this.span*height*layers;
		this.data=new Uint32Array(count).fill(32);
	}

	toStrings(){
		const result=[];
		const w=this.span;
//		let text=String.fromCodePoint(...this.data);
		let text=String.fromCodePoint(...this.data);
		for(let y=0;y<this.height;y++){
			result.push(text.substring(y*w,(y+1)*w));
		}
		return result;
	}

	rect(x,y,width,height,layer=0,value=0xffff){
		const offset=layer*this.height*this.span;
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				const wordIndex = row * this.span + col;
				this.data[offset+wordIndex] = value;
			}
		}    
	}

	drawShape(strings,x,y,layer=0){
		x|=0;
		y|=0;
		layer|=0;
		for(const text of strings){
			let offset=(layer*this.height+y)*this.span+x;
			for(let i=0;i<text.length;i++){
				const charcode=text.charCodeAt(i);
				this.data[offset++]=charcode;
			}
			y++;
		}
	}
};
