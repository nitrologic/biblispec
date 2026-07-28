// bibli.js
// (c)2026 nitrologic
// biblispec MIT License 
// https://opensource.org/licenses/MIT

// https://nitrologic.github.io/biblispec

// todo: module support
// import spec from './biblispec.json' with { type: 'json' };

let terminalPre;
let bibliSpec;

let appWidth=40;
let appHeight=25;

const alphabet="abcdefghijklmnopqrstuvwxyz";

function append(text){
	terminalPre.textContent+=text;
}

function emit(content){
	const uri="\"https://";
	const result=[];
	let index=0;
	while(index<content.length){
		link=content.indexOf(uri,index);
		if(link==-1) break;
		close=content.indexOf("\"",link+1);
		if(close==-1) break;
		url=content.substring(link,close+1);
		result.push(content.slice(index,link));
		result.push(link);
		index=close+1;
	}
	result.push(content.slice(index));
	terminalPre.innerHTML=result.join("");
	//textContent=content;
}

function onSize() {
	const pre=terminalPre;
	const style = window.getComputedStyle(pre);
	const styles=Object.values(style);
	for(const alpha of alphabet){
		alphaStyles=styles.filter(word=>word.startsWith(alpha));
//		console.log("[bibli] style",alpha,alphaStyles);
	}

	const height=parseFloat(style.fontSize); 
	const width=height/2;
	const w=pre.clientWidth;   // Usable internal width
	const h=pre.clientHeight; // Usable internal height

	const cols=(w/width)|0;
	const rows=(h/height)|0;
	if((appWidth!=cols)||(appHeight|=rows)){
		appWidth=cols;
		appHeight=rows;
		console.log("[bibli] onSize",{appWidth,appHeight});
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
	
	append("dimensioning");
	onSize();

	append("reading bibli");
	const spec=await fetchBibli("./biblispec.json");
	console.log("[bibli] spec",spec); 
	console.log("[bibli] spec.name",spec.name);
	bibliSpec=spec;

	const json=JSON.stringify(spec, null, 2);
	emit(json);
}

window.onload=onLoad;
window.addEventListener("resize",onSize);
