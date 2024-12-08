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
function IsLogin(){
	if(typeof document.location.host == 'undefined') return 10;
	if(document.location.host != 'webvpn.guat.edu.cn') return 11;
	if(typeof document.location.pathname == 'undefined' && document.location.pathname == '' && document.location.pathname == null) return 12;
	const _hostname = document.location.pathname.split("/")[2];
	if(_hostname == '77726476706e69737468656265737421f2f452d220256944300d8db9d6562d'){
		// 统一身份认证
		if(typeof document.location.search == 'undefined') return 13;
		let params = new URLSearchParams(document.location.search);
		let appid = params.get("appid");
		if(typeof appid == 'undefined') return 14;
		if(typeof appid == 'string') appid = String(appid);
		switch(appid){
			case '50028272':
				return 1;
				break;
			case '49803038':
				return 2;
				break;
		}
		return 3;
	}
	if(_hostname == '77726476706e69737468656265737421a1a70fcd696126012f'){
		// 教务系统
		if(document.location.pathname.startsWith('/http/77726476706e69737468656265737421a1a70fcd696126012f/frame/homes')){
			// 教务系统首页
			return 0;
		}
		if(document.G_USER_LOGINID){
			// 已登录教务系统
			return 0;
		}
		return 20;
	}
	if(typeof _hostname == 'undefined') return document.location.pathname;
	return _hostname;
}
async function scheduleHtmlProvider(
  iframeContent = '',
  frameContent = '',
  dom = document
) {
	await loadTool('AIScheduleTools');
	try {
		let Login_status = IsLogin();
		const Login_status_tips = {
			10:"无法获得当前页面域名，拒绝服务。",
			11:"您当前页面域名与WebVPN域名不一致。",
			12:"获取当前页面路径失败，重试后问题依旧存在请联系开发者或稍后再试",
			13:"获取统一身份认证APPID出错，请确认是否需要手动授权，授权登录后重试。",
			14:"获取统一身份认证APPID出错，请确认是否需要手动授权，授权登录后重试。",
			20:"教务系统当前可能存在问题，重试后问题依旧存在请联系开发者或稍后再试。",
			1:"请授权登录教务系统后重试。",
			2:"请授权登录WebVPN后重试。",
			3:"请授权登录后重试。"
		}
		if(typeof Login_status != 'number'){
			await AIScheduleAlert({titleText: '错误代码：404',contentText: '当前页面地址：' + Login_status,confirmText: '确认',})
			return 'do not continue';
		}
		if(Login_status != 0){
			if(typeof Login_status_tips[Login_status] == 'undefined'){
				await AIScheduleAlert({titleText: '错误代码：' + Login_status,contentText: '请稍后重试，如仍然存在问题请向开发者报告您的错误信息。',confirmText: '确认',})
			}else{
				await AIScheduleAlert({titleText: '错误代码：' + Login_status,contentText: Login_status_tips[Login_status],confirmText: '确认',})
			}
			return 'do not continue';
		}
		let info = JSON.parse(
			await request('get', 'utf-8', '/http/77726476706e69737468656265737421a1a70fcd696126012f/jw/common/showYearTerm.action')
		)
		let homepage = await request(
		  'get',
		  'utf-8',
		  '/http/77726476706e69737468656265737421a1a70fcd696126012f/frame/home/homepage.jsp'
		)
		let dqxn = homepage.match(/var.*dqxn.*=.*\"(.*)\";/);
		if(dqxn != null && dqxn.length == 2){
			dqxn = dqxn[1];
			info.xn = dqxn;
		}
		let dqxq = homepage.match(/var.*dqxq.*=.*\"(.*)\";/);
		if(dqxq != null && dqxq.length == 2){
			dqxq = dqxq[1];
			info.xqM = dqxq;
		}
		let params = 'xn=' + info.xn + '&xq=' + info.xqM + '&xh=' + info.userCode;
		const userConfrim = await AIScheduleConfirm({
			titleText: '测试功能',
			contentText: '该功能可以导入教务系统中的任意学期课表，但上课时间可能不准确，请谨慎使用！',
			cancelText: '选择学期',
			confirmText: '当前学期',
		});
		if(!userConfrim){
			let test = JSON.parse(
				await request('get', 'utf-8', '/http/77726476706e69737468656265737421a1a70fcd696126012f/frame/droplist/getDropLists.action?comboBoxName=StMsXnxqDxDesc&paramValue')
			)
			if(test.length>0){
				let option = {};
				let show_option = [];
				let defaulted = info.xn + '-' + info.xqM;
				for(i=0;i<test.length;i++){
					option[test[i].name] = test[i].code;
					show_option[i] = test[i].name;
					if(test[i].code == defaulted) {
						defaulted = test[i].name;
					}
				}
				const userSelect = await AIScheduleSelect({
				  titleText: '选择学期',
				  contentText: "请选择需要导入课表的学期\r\n" + defaulted,
				  selectList: show_option
				})
				defaulted = option[userSelect].split('-');
				if(defaulted.length == 2) {
					params = 'xn=' + defaulted[0] + '&xq=' + defaulted[1] + '&xh=' + info.userCode;
				}
			}
		}
		let courseTable = await request(
			'get',
			'gbk',
			'/http/77726476706e69737468656265737421a1a70fcd696126012f/student/wsxk.xskcb10319.jsp?params=' +
			  base64Encode(params)
		 )
		dom = new DOMParser().parseFromString(courseTable, 'text/html')
		let tables = dom.getElementsByTagName('table')
		for(i=0;i<tables.length;i++){
			if(tables[i].id == 'mytable'){
				dom = tables[i]
				break
			}
		}
		
		let infos = await request(
		  'get',
		  'gbk',
		  '/http/77726476706e69737468656265737421a1a70fcd696126012f/public/SchoolTimetable.show.jsp?random=' + Math.random() +
		  '&xn=' +
			info.xn +
			'&xq_m=' +
			info.xqM
		)
		let doms = new DOMParser().parseFromString(infos, 'text/html')
		let tabs = doms.getElementsByTagName('tbody')[0]
		let trs = tabs.getElementsByTagName('tr')
		let times = []
		for (const tr in trs) {
		  if (Object.hasOwnProperty.call(trs, tr)) {
			const element = trs[tr]
			let tds = element.getElementsByTagName('td')
            let num = 0;
            if(tds[num].rowSpan>1) {
                num++;
            }
			times.push({
			  section: tds[num].innerText.replace(/\n|\t/g, ''),
			  startTime: tds[++num].innerText.replace(/\n|\t/g, ''),
			  endTime: tds[++num].innerText.replace(/\n|\t/g, ''),
			})
		  }
		}
		if(!userConfrim){
			homepage = '';
		}
		return JSON.stringify({
			times: times,
			homepage: homepage,
			HTML: dom.outerHTML.replaceAll(/\n|\t/g,"")
			});
	} catch (error) {
		console.error(error)
		await AIScheduleAlert(error.message)
		return 'do not continue';
	}
}
