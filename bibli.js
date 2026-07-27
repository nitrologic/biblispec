//import spec from './biblispec.json' with { type: 'json' };
//console.log("[bibli]",data); 
//console.log("[bibli]",data.name);

let terminalDiv;

function append(text){
	terminalDiv.textContent+=text;
}
function onLoad(){
	terminalDiv=document.getElementById("terminal");
	append("hello world");
}

window.onload=onLoad;
