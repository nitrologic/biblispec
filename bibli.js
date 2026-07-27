let terminalDiv;
let spec;

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
	append("reading bibli");
	spec=await fetchBibli();
	console.log("[bibli] spec",spec); 
	console.log("[bibli] spec.name",spec.name);
	append("done");
}

window.onload=onLoad;

// https://nitrologic.github.io/biblispec
// import spec from './biblispec.json' with { type: 'json' };
