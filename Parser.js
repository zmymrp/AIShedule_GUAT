function scheduleHtmlParser(html) {
	// 按逗号拆分为数组，即1,3-5转为[1,3,4,5]，返回空数组则拆分失败
	let split_comma = function(str){
		// 如果传参不为string则直接返回空数组
		if(typeof(str) != 'string') return [];
		let aa = [];
		// 按逗号分割字符串
		let a1 = str.split(',');
		for(let a11 = 0; a11 < a1.length;a11++){
			// 按减号分割字符串
			let a12 = a1[a11].split('-');
			// 如果结果大于2个元素则遍历元素1到元素2之间的值加入数组，否则直接加入
			if(a12.length >= 2){
				for(let num = Number(a12[0]);num <= Number(a12[1]);num++){
					aa.push(num);
				}
			}else{
				aa.push(Number(a12[0]));
			}
		}
		return aa;
	}
	// 按括号拆分为数组，即15[3-4]转为[周数,节数]，返回空数组则拆分失败
	let split_bracket = function(str){
		// 如果传参不为string则直接返回空数组
		if(typeof(str) != 'string') return [];
		// 按[括号拆分为数组
		let a1 = str.split('[');
		// 如果数组数量小于2（不符合的格式）则返回空数组
		if(a1.length < 2) return [];
		// 利用拆分字符串的方式去掉]括号
		let a12 = a1[1].split(']');
		// 结果为[周数,节数]
		return [a1[0],a12[0]];
	}
	// 判断arr1和arr2是否相同
	let equal_arr = function(arr1, arr2){
		if(arr1.length != arr2.length) return false;
		for(var i = 0; i < arr1.length; i++){
			if(arr1[i] != arr2[i]) return false;
		}
		return true;
	}
	// 获得数组里的最大值
	let array_max = function(arr){
		var max_number = 0;
		for(var i =0; i < arr.length;i++){
			if(arr[i] > max_number){
				max_number = arr[i];
			}
		}
		return max_number;
	}
	// 最后的结果数组
	let result = [];
	// 获取table的所有class为.td的元素
	//let table = $('table .td');
	htmls = JSON.parse(html);
	let table = $(htmls.HTML).find('table .td');
	// 定义一个Map供初步筛选
	let collect = new Map();
	let max_number = {
		weeks: 0,
		sections: 0
	};
	// 遍历table
	for(let table_td = 0; table_td < table.length; table_td ++){
		// 课表天数，一行显示7天，所以天数为7的余数+1
		let day = (table_td % 7) + 1;
		// 遍历每一个div，一个div即一门课
		let td_div = $(table[table_td]).find('div');
		for(let kbi = 0; kbi < td_div.length; kbi++){
		// 临时的课程参数
			re = { sections: [], weeks: [] };
			re.day = day;
			// 跳过空课表
			if(td_div[kbi].attribs.class == 'div_nokb') continue;
			// 跳过空元素
			if(td_div[kbi].children.length < 2) continue;
			re.name = $(td_div[kbi].children[0]).text();
			let kb_one = td_div[kbi].children[1];
			// 跳过空元素
			if(kb_one.children.length < 2) continue;
			re.teacher = kb_one.children[0].data.trim();
			let kb_two = kb_one.children[1];
			// 跳过空元素
			if(kb_two.children.length < 2) continue;
			// 获得周次[节次]格式的数据
			let kb_tmp = kb_two.children[0].data;
			// 按格式分离周次和节次部分
			let [kb_weeks, kb_sections] = split_bracket(kb_tmp);
			// 将字符串的周次和节次表示形式转换为数组形式
			re.weeks = split_comma(kb_weeks);
			re.sections = split_comma(kb_sections);
			// 获得最大的课程周数
			let max_weeks = array_max(re.weeks);
			if(max_weeks > max_number.weeks) max_number.weeks = max_weeks;
			// 获得最大的课程节数
			let max_sections = array_max(re.sections);
			if(max_sections > max_number.sections) max_number.sections = max_sections;
			// 如果没有上课地点则显示未安排上课地点，否则赋值
			if(kb_two.children[1].children.length < 1){
				re.position = '未安排上课地点';
			}else{
				re.position = kb_two.children[1].children[0].data;
			}

			const id = `${re.name}-${re.teacher}-${re.position}-${re.day}`
			// 按照ID先筛选出重复的课程
			if (!collect.has(id)){
				// 不重复；直接加入Map中
				collect.set(id, re);
			}else{
				// 重复；获取已有数据
				tmpp = collect.get(id);
				// 节数是否相同
				if(equal_arr(tmpp.sections , re.sections)){
					// 如果不同周数则直接合并两门相同课程的周数加入Map，否则不处理这个数据
					if(!equal_arr(tmpp.weeks , re.weeks)){
						tmpp.weeks = tmpp.weeks.concat(re.weeks);
						collect.set(id, tmpp);
					}
				}else{
					// 解决多门课程重复2次以上数据被覆盖的问题
					var tmpid = id + '-2';
					while(collect.has(tmpid)){
						tmpid += '0';
					}
					collect.set(tmpid, re);
					// 输出重复的课程数据
					console.log(re,tmpp);
				}
			}
		}
	}
	// 遍历Map加入到result
	collect.forEach(value => {
		result.push(value);
	});
	return {
		courseInfos: result,
		something: {
			max_number: max_number
		}
	};
}