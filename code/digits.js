const numbers={
	ascii: "0123456789",
	cjk: "〇一二三四五六七八九十",
	vai: "꘠꘡꘢꘣꘤꘥꘦꘧꘨꘩",
	cham: "꣐꣑꣒꣓꣔꣕꣖꣗꣘꣙",
	roman: "_ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅬⅭⅮⅯ",
	wide:"０１２３４５６７８９",
	mathematical:"𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗",
	bold:"𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",
	double:"𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",
	monospace:"𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",
	spots:"➀➁➂➃➄➅➆➇➈➉",
	dots:"🄌➊➋➌➍➎➏➐➑➒➓",
	holes:"⓿❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴",
	subscript:"₀₁₂₃₄₅₆₇₈₉",
	superscript:"⁰¹²³⁴⁵⁶⁷⁸⁹",
	enclosed:"⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳",
	enclosed2:"㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿",
	speed:"㉈㉉㉊㉋㉌㉍㉎㉏",
};

function numberString(integral,digits){
	const text=String(integral);
	let result="";
	for(const char of text){
		const digit=char|0;
		result+=digits[digit];
	}
	return result;
}

const digits={
}

/*
	"davani": { "name": "Devanagari", "value": "०१२३४५६७८९" },
	"bengali": { "name": "Bengali", "value": "০১২৩৪৫৬৭৮৯" }
	{ "name": "Gurmukhi", "value": "੦੧੨੩੪੫੬੭੮੯" },
	{ "name": "Gujarati", "value": "૦૧૨૩૪૫૬૭૮૯" },
	{ "name": "Oriya Odia", "value": "୦୧୨୩୪୫୬୭୮୯" },
	{ "name": "Tamil", "value": "௦௧௨௩௪௫௬௭௮௯" },
	{ "name": "Telugu", "value": "౦౧౨౩౪౫౬౭౮౯" },
	{ "name": "Kannada", "value": "೦೧೨೩೪೫೬೭೮೯" },
	{ "name": "Malayalam", "value": "൦൧൨൩൪൫൬൭൮൯" },
	{ "name": "Thai", "value": "๐๑๒๓๔๕๖๗๘๙" },
	{ "name": "Lao", "value": "໐໑໒໓໔໕໖໗໘໙" },
	{ "name": "Tibetan", "value": "༠༡༢༣༤༥༦༧༨༩" },
	{ "name": "Myanmar", "value": "၀၁၂၃၄၅၆၇၈၉" },
	{ "name": "Shan", "value": "႐႑႒႓႔႕႖႗႘႙" },
	{ "name": "Khmer", "value": "០១២៣៤៥៦៧៨៩" },
	{ "name": "Mongolian", "value": "᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙" },
	{ "name": "Limbu", "value": "᥆᥇᥈᥉᥊᥋᥌᥍᥎᥏" },
	{ "name": "Lepcha", "value": "᧐᧑᧒᧓᧔᧕᧖᧗᧘᧙" },
	{ "name": "Saurashtra", "value": "᪀᪁᪂᪃᪄᪅᪆᪇᪈᪉" },
	{ "name": "Kayah Li", "value": "᪐᪑᪒᪓᪔᪕᪖᪗᪘᪙" },
	{ "name": "Thai (Tai Tham)", "value": "᭐᭑᭒᭓᭔᭕᭖᭗᭘᭙" },
	{ "name": "Balinese", "value": "᮰᮱᮲᮳᮴᮵᮶᮷᮸᮹" },
	{ "name": "Sundanese", "value": "᱀᱁᱂᱃᱄᱅᱆᱇᱈᱉" },
	{ "name": "New Tai Lue", "value": "꤀꤁꤂꤃꤄꤅꤆꤇꤈꤉" },
	{ "name": "Ol Chiki", "value": "꧐꧑꧒꧓꧔꧕꧖꧗꧘꧙" },
	{ "name": "Meetei Mayek", "value": "꧰꧱꧲꧳꧴꧵꧶꧷꧸꧹" },
	{ "name": "Javanese", "value": "꩐꩑꩒꩓꩔꩕꩖꩗꩘꩙" },
	{ "name": "Myanmar (Tai Laing)", "value": "꯰꯱꯲꯳꯴꯵꯶꯷꯸꯹" },
	{ "name": "Warang Citi", "value": "᱐᱑᱒᱓᱔᱕᱖᱗᱘᱙" },
	{ "name": "Persian", "value": "٠١٢٣٤٥٦٧٨٩" },
};

const scriptDigits=[
	"0123456789", 
	"〇一二三四五六七八九", 
	"٠١٢٣٤٥٦٧٨٩", "०१२३४५६७८९",
	"০১২৩৪৫৬৭৮৯", "੦੧੨੩੪੫੬੭੮੯", "૦૧૨૩૪૫૬૭૮૯", "୦୧୨୩୪୫୬୭୮୯",
	"௦௧௨௩௪௫௬௭௮௯", "౦౧౨౩౪౫౬౭౮౯", "೦೧೨೩೪೫೬೭೮೯", "൦൧൨൩൪൫൬൭൮൯",
	"෦෧෨෩෪෫෬෭෮෯", "๐๑๒๓๔๕๖๗๘๙", "໐໑໒໓໔໕໖໗໘໙", "༠༡༢༣༤༥༦༧༨༩",
	"၀၁၂၃၄၅၆၇၈၉", "႐႑႒႓႔႕႖႗႘႙", "០១២៣៤៥៦៧៨៩", "᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙",
	"᥆᥇᥈᥉᥊᥋᥌᥍᥎᥏", "᧐᧑᧒᧓᧔᧕᧖᧗᧘᧙", "᪀᪁᪂᪃᪄᪅᪆᪇᪈᪉", "᪐᪑᪒᪓᪔᪕᪖᪗᪘᪙",
	"᭐᭑᭒᭓᭔᭕᭖᭗᭘᭙", "᮰᮱᮲᮳᮴᮵᮶᮷᮸᮹", "᱀᱁᱂᱃᱄᱅᱆᱇᱈᱉", "꘠꘡꘢꘣꘤꘥꘦꘧꘨꘩",
	"꣐꣑꣒꣓꣔꣕꣖꣗꣘꣙", "꤀꤁꤂꤃꤄꤅꤆꤇꤈꤉", "꧐꧑꧒꧓꧔꧕꧖꧗꧘꧙", "꧰꧱꧲꧳꧴꧵꧶꧷꧸꧹",
	"꩐꩑꩒꩓꩔꩕꩖꩗꩘꩙", "꯰꯱꯲꯳꯴꯵꯶꯷꯸꯹", "᱐᱑᱒᱓᱔᱕᱖᱗᱘᱙"
];

"circled":"⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿"

*/
