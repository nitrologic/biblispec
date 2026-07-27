// bibli.js
// (c)2026 nitrologic
// biblispec MIT License 
// https://opensource.org/licenses/MIT

let terminalPre;
let bibliSpec;

let appWidth=40;
let appHeight=25;

function append(text){
	terminalPre.textContent+=text;
}

function pollSize(pre) {
	const style = window.getComputedStyle(pre);
	console.log("[bibli] style",style.cssText);

	const width=50;
	const height=parseFloat(style.fontSize); 
	const w=pre.clientWidth;   // Usable internal width
	const h=pre.clientHeight; // Usable internal height

	const cols=(w/width)|0;
	const rows=(h/height)|0;
	if((appWidth!=cols)||(appHeight|=rows)){
		appWidth=cols;
		appHeight=rows;
		console.log("[bibli] resize",{appWidth,appHeight});
	}
}

async function fetchBibli(path){
	try {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error(response);
		}
		const content = await response.json();
		return content;

	} catch (error) {
		console.error("[bibli] fetch error", error);
	}
}

async function onLoad(){
	const pre=document.getElementById("terminal");
	console.log("[bibli] pre",pre); 
	terminalPre=pre;
	
	append("dimensioning pre");
	pollSize(pre);

	append("reading bibli");
	const spec=await fetchBibli("./biblispec.json");
	console.log("[bibli] spec",spec); 
	console.log("[bibli] spec.name",spec.name);
	bibliSpec=spec;

	append("done");
}

window.onload=onLoad;

// https://nitrologic.github.io/biblispec
// import spec from './biblispec.json' with { type: 'json' };
