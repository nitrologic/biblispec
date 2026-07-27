import spec from './biblispec.json' with { type: 'json' };

let terminalDiv;

function append(text){
	terminalDiv.textContent+=text;
}
function onLoad(){
	terminalDiv=document.getElementById("terminal");
	append("hello world");

	console.log("[bibli]",spec); 
	console.log("[bibli]",spec.name);

}

window.onload=onLoad;

// https://nitrologic.github.io/biblispec
