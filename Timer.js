async function rquestUnit(tag, encod, url, data) {
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
  return await fetch(url, {
    method: tag,
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((rp) => rp.blob().then((v) => formatText(v, encod)))
    .then((v) => v)
    .catch((er) => er)
}
async function scheduleTimer(
  providerRes,
  parserRes
) {
	try {
    let info = JSON.parse(
      await rquestUnit('post', 'gbk', '/http/77726476706e69737468656265737421a1a70fcd696126012f/jw/common/showYearTerm.action')
    )

    let infos = await rquestUnit(
      'post',
      'gbk',
      '/http/77726476706e69737468656265737421a1a70fcd696126012f/public/SchoolTimetable.show.jsp?random=' + Math.random(),
      'xn=' +
        info.xn +
        '&xq_m=' +
        info.xqM +
        '&sel_xn_xq=' +
        info.xn +
        '-' +
        info.xqM +
        '&btnQry=%BC%EC%CB%F7&btnPreview=%B4%F2%D3%A1&menucode_current='
    )
    console.log(infos)
    let doms = new DOMParser().parseFromString(infos, 'text/html')
    let tabs = doms.getElementsByTagName('tbody')[0]
    let trs = tabs.getElementsByTagName('tr')
    let times = []
    for (const tr in trs) {
      if (Object.hasOwnProperty.call(trs, tr)) {
        const element = trs[tr]
        let tds = element.getElementsByTagName('td')
        times.push({
          section: tds[0].innerText.replace(/\n|\t/g, ''),
          startTime: tds[1].innerText.replace(/\n|\t/g, ''),
          endTime: tds[2].innerText.replace(/\n|\t/g, ''),
        })
      }
    }
    // console.log(times)
    // console.log(trs)
	// console.log(document.getElementById("frmDesk").contentWindow.document.getElementById("jxz").value);
	let homepage = await rquestUnit(
      'get',
      'utf-8',
      '/http/77726476706e69737468656265737421a1a70fcd696126012f/frame/home/homepage.jsp'
    )
	let startSemester = ''
	let homepages = new DOMParser().parseFromString(homepage, 'text/html')
	let scripts = homepages.getElementsByTagName('script')
	let script = ''
	for(i=0;i<scripts.length;i++){
		if(typeof scripts[i].innerHTML != ''){
			script += scripts[i].innerHTML
		}
	}
	let dqjxz = script.match(/var.*dqjxz.*=.*\"(.*)\";/)
	console.log("dqjxz=",dqjxz)
	if(dqjxz.length == 2){
		// 当前时间
		let now = new Date();
		let dqzs = Number(dqjxz[1]);
		if(dqzs > 0){
			// 获取第几周前的今天的时间戳
			let tmp_time = now.getTime() - (86400000 * (dqzs - 1) * 7)
			// 今天是星期几，0为星期天
			if(now.getDay() == 0){
				tmp_time -= 86400000 * 6
			}else{
				tmp_time -= 86400000 * (now.getDay() - 1)
			}
			startSemester = tmp_time + ""
		}
	}
	
    return {
      totalWeek: 20, // 总周数：[1, 30]之间的整数
      startSemester: startSemester, // 开学时间：时间戳，13位长度字符串，推荐用代码生成
      startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
      showWeekend: true, // 是否显示周末
      forenoon: 4, // 上午课程节数：[1, 10]之间的整数
      afternoon: 4, // 下午课程节数：[0, 10]之间的整数
      night: times.length - 8, // 晚间课程节数：[0, 10]之间的整数
      sections: times // 课程时间表，注意：总长度要和上边配置的节数加和对齐
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}