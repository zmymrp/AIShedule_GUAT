async function request(tag, encod, url) {
  console.log('fetch.....')
  let formatText = (text, encoding) => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = (event) => {
        resolve(fr.result)
      }

      fr.onerror = (err) => {
        reject(err)
      }

      fr.readAsText(text, encoding)
    })
  }
  return await fetch(url, { method: tag })
    .then((rp) => rp.blob().then((v) => formatText(v, encod)))
    .then((v) => v)
    .catch((er) => er)
}
function base64Encode(input) {
  var _keys =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  //if (this.is_unicode) input = this._u2a(input);
  var output = ''
  var chr1,
    chr2,
    chr3 = ''
  var enc1,
    enc2,
    enc3,
    enc4 = ''
  var i = 0
  do {
    chr1 = input.charCodeAt(i++)
    chr2 = input.charCodeAt(i++)
    chr3 = input.charCodeAt(i++)
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output =
      output +
      _keys.charAt(enc1) +
      _keys.charAt(enc2) +
      _keys.charAt(enc3) +
      _keys.charAt(enc4)
    chr1 = chr2 = chr3 = ''
    enc1 = enc2 = enc3 = enc4 = ''
  } while (i < input.length)
  return output
}
async function scheduleHtmlProvider(
  iframeContent = '',
  frameContent = '',
  dom = document
) {
	try {
		let info = JSON.parse(
			await request('get', 'gbk', '/http/77726476706e69737468656265737421a1a70fcd696126012f/jw/common/showYearTerm.action')
		)
		let courseTable = await request(
			'get',
			'gbk',
			'/http/77726476706e69737468656265737421a1a70fcd696126012f/student/wsxk.xskcb10319.jsp?params=' +
			  base64Encode(
				'xn=' + info.xn + '&xq=' + info.xqM + '&xh=' + info.userCode
			  )
		 )
		dom = new DOMParser().parseFromString(courseTable, 'text/html')
		console.log(dom)
		let tables = dom.getElementsByTagName('table')
		console.log(tables)
		for(i=0;i<tables.length;i++){
			if(tables[i].id == 'mytable'){
				dom = tables[i]
				break
			}
		}
		return dom.outerHTML
	} catch (e) {
		console.error(e)
	}
}