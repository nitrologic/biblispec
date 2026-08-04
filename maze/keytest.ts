// keytest.ts

const keyboardBuffer = new Uint8Array(2048);

const stdin=Deno.stdin;
stdin.setRaw(true);
while(true){
	const bytes = await stdin.read(keyboardBuffer); 
    if(!bytes)break;
    const sub=keyboardBuffer.subarray(0,bytes);
    console.log({sub});
//    const line=stdin.read
}