async function scheduleTimer({
  providerRes,
  parserRes
} = {}) {
	try {
		console.log(parserRes);
		let information = JSON.parse(providerRes);
		let times = information.times
		let homepage = information.homepage
		let startSemester = ''
		let scripts = new DOMParser().parseFromString(homepage, 'text/html').getElementsByTagName('script')
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
		let totalWeek = parserRes.something.max_number.weeks > 16?parserRes.something.max_number.weeks:30;
		
		return {
		  totalWeek: totalWeek, // 总周数：[1, 30]之间的整数
		  startSemester: startSemester, // 开学时间：时间戳，13位长度字符串，推荐用代码生成
		  startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
		  showWeekend: true, // 是否显示周末
		  forenoon: 4, // 上午课程节数：[1, 10]之间的整数
		  afternoon: 4, // 下午课程节数：[0, 10]之间的整数
		  night: times.length - 8, // 晚间课程节数：[0, 10]之间的整数
		  sections: times // 课程时间表，注意：总长度要和上边配置的节数加和对齐
		}
	} catch (e) {
		await loadTool('AIScheduleTools')
		await AIScheduleAlert(e.message)
		console.error(e)
		return {}
	}
}