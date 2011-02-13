// iepp v1.6.2 MIT @jon_neal
(function(win, doc) {
	//taken from modernizr
	if ( !window.attachEvent || !doc.createStyleSheet || !(function(){ var elem = document.createElement("div"); elem.innerHTML = "<elem></elem>";return elem.childNodes.length !== 1; })()) {
		return;
	}
	win.iepp = win.iepp || {};
	var iepp = win.iepp,
		elems = iepp.html5elements || 'abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video',
		elemsArr = elems.split('|'),
		elemsArrLen = elemsArr.length,
		elemRegExp = new RegExp('(^|\\s)('+elems+')', 'gi'), 
		tagRegExp = new RegExp('<(\/*)('+elems+')', 'gi'),
		ruleRegExp = new RegExp('(^|[^\\n]*?\\s)('+elems+')([^\\n]*)({[\\n\\w\\W]*?})', 'gi'),
		docFrag = doc.createDocumentFragment(),
		html = doc.documentElement,
		head = html.firstChild,
		bodyElem = doc.createElement('body'),
		styleElem = doc.createElement('style'),
		body;
	function shim(doc) {
		var a = -1;
		while (++a < elemsArrLen)
			// Use createElement so IE allows HTML5-named elements in a document
			doc.createElement(elemsArr[a]);
	}
	
	iepp.getCSS = function(styleSheetList, mediaType) {
		if(styleSheetList+'' === undefined){return '';}
		var a = -1,
			len = styleSheetList.length,
			styleSheet,
			cssTextArr = [];
		while (++a < len) {
			styleSheet = styleSheetList[a];
			
			// Get css from all non-screen stylesheets and their imports
			if ((mediaType = styleSheet.media || mediaType) != 'screen') cssTextArr.push(iepp.getCSS(styleSheet.imports, mediaType), styleSheet.cssText);
		}
		return cssTextArr.join('');
	};
	
	iepp.parseCSS = function(cssText) {
		var cssTextArr = [],
			rule;
		while ((rule = ruleRegExp.exec(cssText)) != null)
			// Replace all html5 element references with iepp substitute classnames
			cssTextArr.push((rule[1]+rule[2]+rule[3]).replace(elemRegExp, '$1.iepp_$2')+rule[4]);
		return cssTextArr.join('\n');
	};
	
	iepp.writeHTML = function() {
		var a = -1;
		body = body || doc.body;
		while (++a < elemsArrLen) {
			var nodeList = doc.getElementsByTagName(elemsArr[a]),
				nodeListLen = nodeList.length,
				b = -1;
			while (++b < nodeListLen)
				if (nodeList[b].className.indexOf('iepp_') < 0)
					// Append iepp substitute classnames to all html5 elements
					nodeList[b].className += ' iepp_'+elemsArr[a];
		}
		docFrag.appendChild(body);
		html.appendChild(bodyElem);
		// Write iepp substitute print-safe document
		bodyElem.className = body.className;
		// Replace HTML5 elements with <font> which is print-safe and shouldn't conflict since it isn't part of html5
		bodyElem.innerHTML = body.innerHTML.replace(tagRegExp, '<$1font');
	};
	
	
	iepp._beforePrint = function() {
		// Write iepp custom print CSS
		styleElem.styleSheet.cssText = iepp.parseCSS(iepp.getCSS(doc.styleSheets, 'all'));
		iepp.writeHTML();
	};
	
	iepp._afterPrint = function(){
		// Undo everything done in onbeforeprint
		bodyElem.innerHTML = '';
		html.removeChild(bodyElem);
		html.appendChild(body);
		styleElem.styleSheet.cssText = '';
	};
	
	iepp.restoreHTML = iepp._afterPrint;
	
	// Shim the document and iepp fragment
	shim(doc);
	shim(docFrag);
	
	//
	if(iepp.printProtection){return;}
	
	// Add iepp custom print style element
	head.insertBefore(styleElem, head.firstChild);
	styleElem.media = 'print';
	styleElem.className = 'iepp-printshim';
	win.attachEvent(
		'onbeforeprint',
		iepp._beforePrint
	);
	win.attachEvent(
		'onafterprint',
		iepp._afterPrint
	);
})(this, document);