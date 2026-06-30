// menu.ts 1-maze 2-traffic 3-grid

async function runDeno(appName: string) {
    const command = new Deno.Command("deno", {
        args: ["run", "-A", `${appName}.ts`],
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit"
    });
    const process = command.spawn();
    await process.status;
}

async function oldRunDeno(appName: string) {
	const p = Deno.run({ cmd: ["deno", "run", `${appName}.ts`] });
	await p.status();
}

let apps=["maze","traffic","grid"];
let index=1;
let options=[];
for(let appname of apps){
	options.push(" "+index+"-"+appname);
	index++;
}
let running=true;
while(running){
	const choice = prompt("run "+options.join(" "));
	const appIndex=parseInt(choice)||0;
	if(appIndex<1) break;
	const app=apps[appIndex-1]
//	console.log("you chose choice:",choice,app);
	runDeno(app)
}
