function scheduleHtmlParser(html) {
	let split_comma = function(str){
		if(typeof(str) != 'string') return [];
		let aa = [];
		let a1 = str.split(',');
		for(let a11 = 0; a11 < a1.length;a11++){
			let a12 = a1[a11].split('-');
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

	let split_bracket = function(str){
		if(typeof(str) != 'string') return [];
		let a1 = str.split('[');
		if(a1.length < 2) return [];
		let a12 = a1[1].split(']');
		return [a1[0],a12[0]];
	}
	let equal_arr = function(arr1, arr2){
		if(arr1.length != arr2.length) return false;
		for(var i = 0; i < arr1.length; i++){
			if(arr1[i] != arr2[i]) return false;
		}
		return true;
	}

	const result = [];
	let table = $('table .td');
	const collect = new Map();
	let old = [];
	for(let table_td = 0; table_td < table.length; table_td ++){
		let re = { sections: [], weeks: [] };
		let day = (table_td % 7) + 1;
		let td_div = $(table[table_td]).find('div');
		for(let kbi = 0; kbi < td_div.length; kbi++){
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
			let kb_tmp = kb_two.children[0].data;
			let [kb_weeks, kb_sections] = split_bracket(kb_tmp);
			re.weeks = split_comma(kb_weeks);
			re.sections = split_comma(kb_sections);
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
					console.log(re,tmpp);
				}
			}
		}
	}
	collect.forEach(value => {
		result.push(value);
	});
	return result;
}