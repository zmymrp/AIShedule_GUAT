function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {//函数名不要动
  // 以下可编辑
	const ifrs = dom.getElementsByTagName("iframe");
	if (ifrs.length) {
		for (let i = 0; i < ifrs.length; i++) {
			if (ifrs[i].id == 'frmDesk'){
				const dom = ifrs[i].contentDocument.body.parentElement;
				iframeContent += scheduleHtmlProvider(iframeContent, frameContent, dom);
			}else if (ifrs[i].id == 'frmReport'){
				const dom = ifrs[i].contentDocument.body.parentElement
				iframeContent += scheduleHtmlProvider(iframeContent, frameContent, dom);
			}
		}
	}
	if(!ifrs.length){
		return dom.querySelector('#mytable').outerHTML.replace('<br>',"\r\n");
	}
	return iframeContent;
}