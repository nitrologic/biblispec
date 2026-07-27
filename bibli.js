let terminalDiv;
let spec;

let appWidth=40;
let appHeight=25;

function pollSize(pre) {
	const style = window.getComputedStyle(pre);
	console.log("[bibli] style",style);

	const width=50;
	const height=parseFloat(style.fontSize); 
	const w=el.clientWidth;   // Usable internal width
	const h=el.clientHeight; // Usable internal height

	const cols=(w/width)|0;
	const rows=(h/height)|0;
	if((appWidth!=cols)||(appHeight|=rows)){
		appWidth=cols;
		appHeight=rows;
		console.log("[bibli] resize",{appWidth,appHeight});
	}
}

async function fetchBibli(){
	try {
		const response = await fetch('./biblispec.json');
		if (!response.ok) {
			throw new Error(response);
		}
		spec = await response.json();
		return spec;

	} catch (error) {
		console.error("[bibli] fetch error", error);
	}
}
function append(text){
	terminalDiv.textContent+=text;
}
async function onLoad(){
	terminalDiv=document.getElementById("terminal");
	console.log("[bibli] pre",pre); 
	append("dimensioning pre");
	pollSize(pre);
	append("reading bibli");
	spec=await fetchBibli();
	console.log("[bibli] spec",spec); 
	console.log("[bibli] spec.name",spec.name);
	append("done");
}

window.onload=onLoad;

// https://nitrologic.github.io/biblispec
// import spec from './biblispec.json' with { type: 'json' };
