
```
"archaic":{
	"RFC2119keywords": [
		"MUST",
		"MUST_NOT",
		"SHALL",
		"SHALL_NOT",
		"SHOULD",
		"SHOULD_NOT",
		"MAY",
		"REQUIRED",
		"OPTIONAL",
		"RECOMMENDED",
		"NOT_RECOMMENDED"
	]
	"guidance": {
		"capitalization": "uppercase for normative",
		"lowercaseAllowed": true,
		"ambiguityWarning": "do not use for non-requirements",
		"securityConsiderations": "imperatives affect implementation safety"
	},
	"usage": {
		"shallEqualsMust": true,
		"shouldNotEqualsNotRecommended": true,
		"mayEqualsOptional": true
	}
}
```

| modern | archaic | flavor |
|--------|---------|--------|
| began | begun | past participle standalone |
| is | be | subjunctive/static |
| has | hath | third person |
| will | shall | obligation not future |
| you | thou/thee | singular familiar |
| your | thy/thine | possessive |
| -ing | -eth/-est | verb endings |

```
{
  "block": {
	"name": "codepoint_card",
	"shall_render": true,
	"dimensions": {
	  "width": 32,
	  "height": 16,
	  "shall_clip": true
	},
	"content": {
	  "glyph": "┼",
	  "codepoint": "0x253C",
	  "name": "BOX DRAWINGS LIGHT VERTICAL AND HORIZONTAL",
	  "shall_center": true
	},
	"borders": {
	  "top": "═",
	  "bottom": "═",
	  "left": "║",
	  "right": "║",
	  "corners": {
		"northwest": "╔",
		"northeast": "╗",
		"southwest": "╚",
		"southeast": "╝"
	  }
	},
	"behavior": {
	  "on_overflow": "SHALL_TRUNCATE",
	  "on_focus": "SHALL_HIGHLIGHT",
	  "shall_accept_input": false
	}
  }
}
```
