// language ✴ biblispec 2026

// reference - ECMAScript internationalization standard (ECMA-402) 

const types=["timeZone","collation","calendar","unit","numberingSystem","currency"] as const;

for(const name of types){
	const values=Intl.supportedValuesOf(name);
	if(name=="timeZone"){
		const zones=Intl.supportedValuesOf("timeZone");
		const now=new Date();
		const timeZoneName="shortOffset";
		for(const timeZone of zones){
//			const t=Intl.DateTimeFormat("en", { timeZone, timeZoneName })
			const t=now.toLocaleString("en", { timeZone, timeZoneName });
			const s=t.indexOf(" GMT");
			if(s<0){
				console.log("ERRROR");
				continue;
			}
			console.log(timeZone,t.slice(s+4)||"+0");
		}
	}else{
		console.log(name,JSON.stringify(values));    
	}
}

console.log(navigator.language)
