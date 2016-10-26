//简单的轮播
//接收参数：0.显示的图片数量；1.每次轮播图片数量；2.自动轮播时间间隔；3.是否自动轮播；5.是否显示滚动点；6.左右箭头是否隐藏；7.轮播容器
//不是整倍数，也就是说图片第一张和最后一张同时出现在可视区域的时候，该取哪一个点？（第一个还是最后一个，是个取舍问题，不算bug），应该所有的点都不选，即opacity一致
;(function(){
	var slider=function(settings){
		var _this=this;
		this.settings={
			box:"",
			img_num:4,//显示多少张图片
			img_lb:4,//每次滚动多少张图片
			timer:500,
			auto:false,
			spot:false,
			arrow:false,
			offset_num:0//滑块偏移距离，其实初始的偏移距离并不是0，是滑块的1/3，这里仅仅是为了定义上的方便。
		};
		this.indexNum=0;//spot的初始下标定义为0
		this.extend(this.settings,settings);
		var box_id=this.settings.box;
		var elem_dom=document.getElementById(box_id);//获取dom对象
		var elsm_dom_s_num=elem_dom.getElementsByClassName("slider_list").length;
		elem_dom.style.overflow="hidden";//强制超出的部分隐藏
		var arr_w_h=this.wid_hei(elem_dom);
		var slider_move_width=this.create_slider(elem_dom,arr_w_h[0],arr_w_h[1],this.settings.img_num,elsm_dom_s_num);
		var slider_move=elem_dom.getElementsByClassName("slider_move")[0];
		this.redraw_dom(elem_dom,arr_w_h[0],arr_w_h[1],this.settings.img_num);
		var spot_num=this.create_spot(elem_dom,this.settings.img_num,this.settings.img_lb);//sopt的数量,在clone之前执行
		this.clone_slider_list(elem_dom,slider_move,slider_move_width);
		this.remove_slider(elem_dom);
		this.create_arrow(elem_dom);
		this.create_spot_dom(elem_dom,spot_num);//创建spot元素,写在remove_slider之后
		var spot_dom_arr=elem_dom.getElementsByClassName("spot_dom_list");//长得像数组，但是却不是数组，所以没有forEach方法
		var spot_dom_arr_length=spot_dom_arr.length;//长度
		var spot_dom=elem_dom.getElementsByClassName("spot_dom_list")[0]; 
		//console.log(elem_dom.getElementsByClassName("spot_dom_list"));
		spot_dom.style.opacity=0.7;
		spot_dom.className="spot_dom_list spot_dom_list_active";
		Array.prototype.forEach.call(spot_dom_arr,function(e){//使用Array.forEach.call报错,Array还没有实例
			e.onclick=function(){//使用this，指向window，不是很明白
				Array.prototype.forEach.call(spot_dom_arr,function(e){
					e.className="spot_dom_list";
					e.style.opacity=0.5;
				})
				this.className="spot_dom_list spot_dom_list_active";
				this.style.opacity=0.7;
				//console.log(spot_dom_arr.item(4))
				for(var i=0;i<spot_dom_arr_length;i++){//实现jq的index方法，找到对应的位置
					//jq实现的方法（并不是通过className来判断的）：function(e){return e?"string"==typeof e?x.inArray(this[0],x(e)):x.inArray(e.jquery?e[0]:e,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1}
					if(spot_dom_arr.item(i).className=="spot_dom_list spot_dom_list_active"){
						_this.indexNum=i;//重置初始下标
					}	
				}
				_this.settings.offset_num=_this.spot_move(slider_move,arr_w_h[0],_this.settings.img_num,_this.settings.img_lb,_this.indexNum,slider_move_width);//执行代码，并重置偏移距离
			}
		});
//		spot_dom_arr.forEach(function(){//不能写出来，spot_dom_arr里面并没有这个函数，要写出来，则需要定义
//			console.log("heh")
//		})
		if(!this.settings.arrow){//是否显示左右箭头
			elem_dom.getElementsByClassName("arrow_slider")[0].style.display="none";
			elem_dom.getElementsByClassName("arrow_slider")[1].style.display="none";
		}
		if(!this.settings.spot){//是否显示点
			elem_dom.getElementsByClassName("spot_dom_contain")[0].style.display="none";
		}
		_this.settings.offset_num=-(slider_move_width/3);//重置偏移距离为滑块的1/3；
		elem_dom.getElementsByClassName("arrow_slider_left")[0].onclick=slider_left;	
		elem_dom.getElementsByClassName("arrow_slider_right")[0].onclick=slider_right;
		function slider_left(){//向左边滑动函数,发现不能定义在prototype里面
			if(_this.indexNum==spot_dom_arr_length-1){//即如果是最后一个点
				_this.indexNum=0;//如果是最后一个点，则点击左滑动的时候，变为第一个点
			}else{
				_this.indexNum+=1;//不是的话则加1
			}
			Array.prototype.forEach.call(spot_dom_arr,function(e){
				e.className="spot_dom_list";
				e.style.opacity=0.5;
			})
			spot_dom_arr.item(_this.indexNum).className=="spot_dom_list spot_dom_list_active";
			spot_dom_arr.item(_this.indexNum).style.opacity=0.7;
			
			_this.settings.offset_num-=arr_w_h[0]/_this.settings.img_num*_this.settings.img_lb;
			//console.log(_this.settings.offset_num);
			slider_move.style.transition="all .5s ease-in-out";//可以单独一个CSS，来修饰这些东西，懒得弄了
			elem_dom.getElementsByClassName("slider_move")[0].style.transform="translateX("+_this.settings.offset_num+"px)";//不兼容IE8，可以使用animate，left等方法实现兼容
			if(Math.abs(_this.settings.offset_num)>=slider_move_width*2/3){//translateX长度>滑块（slider_move）的长度2/3时，说明第2栏图片完全不在可见区域（一共clone了3栏一样的图片）
				setTimeout(function(){//500ms之后（transform之后）移动，但是移动到的位置，图片是第二栏相同的图片位置，给人没有移动的假象，其实是移动了的
					_this.settings.offset_num=-(Math.abs(_this.settings.offset_num)-slider_move_width/3);//偏移的位置
					//console.log(_this.settings.offset_num+"aa");
					slider_move.style.transition="all 0s ease-in-out";//瞬间完成，给人没有移动的假象
					elem_dom.getElementsByClassName("slider_move")[0].style.transform="translateX("+_this.settings.offset_num+"px)";
				},500);	
			}
		};
		function slider_right(){//向左边滑动函数
			if(_this.indexNum==0){//即如果是第一个点
				_this.indexNum=spot_dom_arr_length-1;//如果是第一个点，则点击右滑动的时候，变为最后一个点
			}else{
				_this.indexNum-=1;//不是的话则减1
			}
			Array.prototype.forEach.call(spot_dom_arr,function(e){
				e.className="spot_dom_list";
				e.style.opacity=0.5;
			})
			spot_dom_arr.item(_this.indexNum).className=="spot_dom_list spot_dom_list_active";
			spot_dom_arr.item(_this.indexNum).style.opacity=0.7;
			
			_this.settings.offset_num+=arr_w_h[0]/_this.settings.img_num*_this.settings.img_lb;//还是以左偏移为基准，左右点击经常互换，所以基准最好不要换
			//console.log(_this.settings.offset_num);
			slider_move.style.transition="all .5s ease-in-out";//可以单独一个CSS，来修饰这些东西，懒得弄了
			elem_dom.getElementsByClassName("slider_move")[0].style.transform="translateX("+_this.settings.offset_num+"px)";//不兼容IE8，可以使用animate，left等方法实现兼容
			//偏移距离小于滑块1/3-slider_wrap的宽度时，说明第2栏图片在不可见区域
			if(Math.abs(_this.settings.offset_num)<=slider_move_width/3-arr_w_h[0]){
				setTimeout(function(){//500ms之后（transform之后）移动，但是移动到的位置，图片是第二栏相同的图片位置，给人没有移动的假象，其实是移动了的
					if(_this.settings.offset_num>0){//偏移量是正的
						//console.log("哈哈")
						_this.settings.offset_num=Math.abs(_this.settings.offset_num)-slider_move_width/3;//偏移的位置	
					}else{
						_this.settings.offset_num=-(Math.abs(_this.settings.offset_num)+slider_move_width/3);//偏移的位置	
					}
					//console.log(_this.settings.offset_num+"bb");
					slider_move.style.transition="all 0s ease-in-out";//瞬间完成，给人没有移动的假象
					elem_dom.getElementsByClassName("slider_move")[0].style.transform="translateX("+_this.settings.offset_num+"px)";
				},500);	
			}
		};
		if(this.settings.auto){
			autoplay=setInterval(function(){//自动轮播，设置为全局变量，下次启动的时候，指针一样
				slider_left();
			},this.settings.timer);
			elem_dom.onmouseenter=function(){//鼠标移入的时候，自动轮播停止
				clearInterval(autoplay);
			};
			elem_dom.onmouseleave=function(){//鼠标移出的时候，轮播再次开始
				autoplay=setInterval(function(){//自动轮播
					slider_left();
				},_this.settings.timer);
			}
		};
	}
	slider.prototype={
		extend:function(a,b){//拓展参数
			for (var k in a){
				if(b[k]!==undefined){//用a.k失败，不知道为什么
					a[k]=b[k];
				}
			}
		},
		wid_hei:function(a){//获取容器宽高
			var width=a.clientWidth;
			var height=a.clientHeight;
			return [width,height];
		},
		redraw_dom:function(a,b,c,d){//slider_list宽高和float等一些属性
			var elem_dom_son=a.getElementsByClassName("slider_list");
			var k=elem_dom_son.length//先定义出来，就不会在循环的时候重复定义
			for(var i=0;i<k;i++){//js原生需要遍历
				elem_dom_son[i].style.width=b/d+"px";
				elem_dom_son[i].style.height=c+"px";
				elem_dom_son[i].style.float="left";
			}
		},
		create_slider:function(a,b,c,d,e){//创建滑块和包裹滑块的容器
			var slider_wrap=document.createElement("div");//包裹滑块的dom
			slider_wrap.style.width=b+"px";
			slider_wrap.style.height=c+"px";
			slider_wrap.className="slider_wrap"; //JQ addclass
			var slider=document.createElement("div");//滑块
			//console.log(b+"||"+c+"||"+d+"||"+e)
			slider.style.width=b/d*e*3+"px";//乘以3用于克隆，slider_move的长度=每个元素长度*元素个数*3
			slider.style.height=c+"px";
			slider.className="slider_move"; //JQ addclass
			slider_wrap.appendChild(slider)//向元素添加新的子节点，作为最后一个子节点。
			a.appendChild(slider_wrap);
			//console.log(b/d*e)
			return b/d*e*3;
		},
		clone_slider_list:function(a,b,c){//克隆slider_list，JQ clone
			var elem_dom_son=a.getElementsByClassName("slider_list");
			var k=elem_dom_son.length;//先定义出来，如果直接在for循环中使用elem_dom_son.length，会导致无限循环，因为slider_list在一直增多（就算不增多也应该先定义出来，就不会每次都定义了）
			//console.log(elem_dom_son.length)
			for(var i=0;i<3*k;i++){//克隆3份，因为原来的要移除，而且左右都要有一份，这样才能实现滚动重复效果
				var node_clone=elem_dom_son[i].cloneNode(true);//设置为true，克隆所有后代，false，只克隆第一级
				node_clone.className="slider_list slider_clone";
				b.appendChild(node_clone);
				//console.log("hehe")
			}
			//console.log(c)
			b.style.transform="translateX("+(-c/3)+"px)";//整体往左边偏移整个滑块的1/3，使左右两边都有重复的内容
		},
		remove_slider:function(a){//原来的slider_list移除，因为JS原生没有wrap方法。所以使用这个方法和clone_slider_list实现包裹
			var k=a.children.length;
			for(var i=0;i<k-1;i++){
				//console.log(a.children[0])
				a.removeChild(a.children[0]);//因为循环的时候，删除了子元素，下次运算的时候，dom树发生了变化，所以每次删除的都是第一项
			}
		},
		create_arrow:function(a){//创建左右滑块
			var arrow_div_left=document.createElement("div");
			arrow_div_left.className="arrow_slider arrow_slider_left";
			arrow_div_left.style.position="absolute";
			arrow_div_left.style.width="40px";
			arrow_div_left.style.height="100%";
			arrow_div_left.style.backgroundColor="black";
			arrow_div_left.style.opacity=0.3;
			arrow_div_left.style.cursor="pointer";
			arrow_div_left.style.top="0";
			arrow_div_left.style.left="0";
			var arrow_div_right=arrow_div_left.cloneNode(true);//克隆dom属性
			arrow_div_right.style.left="initial";//重置做变距离
			arrow_div_right.className="arrow_slider arrow_slider_right"
			arrow_div_right.style.right="0";
			a.appendChild(arrow_div_left);
			a.appendChild(arrow_div_right);
		},
		create_spot:function(a,b,c){//spot的数量
			var elem_dom_son=a.getElementsByClassName("slider_list");
			var k=elem_dom_son.length//先定义出来，就不会在循环的时候重复定义
			var spot_num=1+Math.ceil((k-b)/c);//点的数量
			return spot_num;
		},
		create_spot_dom:function(a,b){//创建spot元素
			var spot_dom_contain=document.createElement("div");
			spot_dom_contain.className="spot_dom_contain";
			spot_dom_contain.style.position="absolute";
			spot_dom_contain.style.bottom="15px";
			spot_dom_contain.style.left=0;
			spot_dom_contain.style.right=0;
			spot_dom_contain.style.textAlign="center";
			var spot_dom_list=document.createElement("div");
			spot_dom_list.style.width=20+"px";
			spot_dom_list.style.height=20+"px";
			spot_dom_list.style.borderRadius="100%";
			spot_dom_list.style.margin="0 10px";
			spot_dom_list.style.opacity=0.5;
			spot_dom_list.style.backgroundColor="black";
			spot_dom_list.style.display="inline-block";
			spot_dom_list.style.cursor="pointer";
			spot_dom_list.className="spot_dom_list";
			for(var i=0;i<b;i++){
				var spot_true=spot_dom_list.cloneNode(true);//必须clone，如果直接appendChild(spot_dom_list),虽然遍历了3次，但是会会被认为appendChild的所有属性都一样，只添加一个
				spot_dom_contain.appendChild(spot_true);
			}
			a.appendChild(spot_dom_contain);//a已经是被渲染的元素，所以a.appendChild的时候就会立即渲染
		},
		spot_move:function(a,b,c,d,e,g){//点击点的时候，滑动的距离
			//slider_move,_this.indexNum,slider_move_width,arr_w_h[0],spot_dom_arr_length
			console.log(a+"??"+b+"??"+c+"??"+d+"??"+e)
			var f=-(b/c*d)*e-g/3;//滑动的距离等于每次左右滑动的距离乘以点击的是第几个点
			a.style.transition="all 0.5s ease-in-out"
			a.style.transform="translateX("+f+"px)";
			return f;//返回给左右点击滑动的时候使用
		}
	}
	window.slider=slider;
})()
