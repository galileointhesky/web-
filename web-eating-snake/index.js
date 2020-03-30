var sw=20,
	sh=20,
	tr=24,
	td=24;
//方块分割,跟移动相关不能轻易改动
var snake = null,//实例
	food = null,
	game = null;
function Square(x,y,cla){
	this.x = x*sw;
	this.y = y*sh;
	this.cla = cla;
	
	this.viewContent = document.createElement('div');
	this.viewContent.className = this.cla;
	this.parent = document.getElementById('snakeWrap');
}
Square.prototype.create = function(){//创建方块dom,为什么需要原型?
	this.viewContent.style.position= 'absolute';
	this.viewContent.style.width = sw + 'px';
	this.viewContent.style.height = sh + 'px';
	this.viewContent.style.left = this.x +'px';
	this.viewContent.style.top = this.y + 'px';
	
	this.parent.appendChild( this.viewContent);

};
Square.prototype.remove = function(){
	this.parent.removeChild(this.viewContent);
};

function Snake(){
	this.head = null;
	this.tail = null;
	this.pos = [];
	this.directionNum = {
		left:{
			x:-1,
			y:0
		},
		right:{
			x:1,
			y:0
		},
		up:{
			x:0,
			y:-1
		},
		down:{
			x:0,
			y:1
		}
	}
}
Snake.prototype.init = function() {
	var snakeHead =new Square(2,0,'head');
	snakeHead.create();
	this.head = snakeHead;
	this.pos.push([2,0]);
	 
	var snakeBody1 = new Square(1,0,'body');
	snakeBody1.create();
	this.pos.push([1,0]);
	
	var snakeBody2 = new Square(0,0,'body');
	snakeBody2.create();
	this.tail = snakeBody2;
	this.pos.push([0,0]);
	//链表
	snakeHead.pre = null;
	snakeHead.next = snakeBody1;

	snakeBody1.pre = snakeHead;
	snakeBody1.next = snakeBody2;

	snakeBody2.pre = snakeBody1;
	snakeBody2.next = null;
//添加一个方向属性
	this.direction = this.directionNum.right;
};

//方法用来获取下个位置对应的元素
Snake.prototype.getNextPos = function(){
	var nextPos = [
		this.head.x/sw + this.direction.x,
		this.head.y/sh + this.direction.y
	];
	//下个点撞到自己
	var selfcoll = false;
	this.pos.forEach(function(value){
		if(value[0]==nextPos[0] && value[1]==nextPos[1]){
			selfcoll = true;
			//console.log('true');
		}
	});
	if(selfcoll){
		this.stra.die.call(this);
		return;
	}
	//撞墙
	if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>td-1 || nextPos[1]>tr-1){
		console.log('撞墙了');
		this.stra.die.call(this);
		return;
	}
	//食物
		
	if(food && food.pos[0] ==nextPos[0] && food.pos[1] ==nextPos[1]){
		this.stra.eat.call(this);
		food.remove();
		createFood();
		return;
	}
	
	//普通走
	this.stra.move.call(this);//重要理解call();
};
//处理碰撞
Snake.prototype.stra={
	move:function(format){//参数用于判断eat不
		var newBody = new Square(this.head.x/sw,this.head.y/sh,'body');
		// console.log(this.head.x/sw,this.head.y/sh);
		newBody.next = this.head.next;
		newBody.next.pre = newBody;
		newBody.pre = null;
		this.head.remove();
		newBody.create();
		//创建新的头
		var newHead = new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'head');
		
		newHead.next = newBody;
		newHead.pre = null;
		newBody.pre = newHead;
		newHead.create();
		//更新坐标
		this.pos.splice(0,0,[this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y]);
		this.head = newHead;
		// console.log(this.pos);
		if(!format){
			this.tail.remove();
			this.tail =this.tail.pre;
			this.pos.pop();
		}
		
	},
	eat:function(){
		this.stra.move.call(this,true);
		game.score++;
		bgm2.play();
	},
	die:function(){
		game.over();
	}
}
snake = new Snake();
// snake.init();
// snake.getNextPos();

//创建食物
function createFood(){
	var x=null;
	var y=null;
	
	var include = true;
	while(include){
		x = Math.round(Math.random()*(td-1));
		y = Math.round(Math.random()*(tr-1));
		
		snake.pos.forEach(function(value){
			if(x!=value[0] && y!=value[1]){
				include = false;
			}
		});
	}
	food = new Square(x,y,'food');
	food.pos = [x,y];
	food.create();
}
// createFood();
//创建控制
function Game(){
	this.timer = null;
	this.score = 0;
}

Game.prototype.init = function(){
	snake.init();
	createFood();
	//将其这部分移动到start中,可以实现空格暂定和继续功能.
	// document.onkeydown = function(ev){
	// 	if(ev.which==37 && snake.direction != snake.directionNum.right){
	// 		snake.direction = snake.directionNum.left;
	// 	}
	// 	else if(ev.which==38 && snake.direction != snake.directionNum.down){
	// 		snake.direction = snake.directionNum.up;
	// 	}
	// 	else if(ev.which==39 && snake.direction != snake.directionNum.left){
	// 		snake.direction = snake.directionNum.right;
	// 	}
	// 	else if(ev.which==40 && snake.direction != snake.directionNum.up){
	// 		snake.direction = snake.directionNum.down;
	// 	}
	// 	else if(ev.which ==32 && kaishi ==true){
	// 		game.pause();
	// 	}
	// 	else if(ev.which ==32 && kaishi ==false){
	// 		game.start();
	// 	}
	// }
	this.start();
}
Game.prototype.start = function(){
	this.timer = setInterval(function(){
		snake.getNextPos();
	},150);
	pauseBtn.parentNode.style.display = 'none';
	kaishi = true;
	document.onkeydown = function(ev){
		if(ev.which==37 && snake.direction != snake.directionNum.right){
			snake.direction = snake.directionNum.left;
		}
		else if(ev.which==38 && snake.direction != snake.directionNum.down){
			snake.direction = snake.directionNum.up;
		}
		else if(ev.which==39 && snake.direction != snake.directionNum.left){
			snake.direction = snake.directionNum.right;
		}
		else if(ev.which==40 && snake.direction != snake.directionNum.up){
			snake.direction = snake.directionNum.down;
		}
		else if(ev.which ==32 && kaishi ==true){
			game.pause();
		}
		else if(ev.which ==32 && kaishi ==false){
			game.start();
		}
	}
	//bgm控制
	bgm1.play();
}
var bgm1 = document.getElementById('bgm1');
var bgm2 = document.getElementById('eatBgm');
//开始游戏
Game.prototype.over = function(){
	clearInterval(this.timer);
	alert('得分:'+this.score*10);
	bgm1.load();
	//回到初始
	var snakeWrap = document.getElementById('snakeWrap');
	snakeWrap.innerHTML = '';
	
	snake = new Snake();
	game = new Game();
	var restart = document.querySelector('.startBtn');
	restart.style.display = 'block';
	
}
Game.prototype.pause = function(){
	clearInterval(this.timer);
	pauseBtn.parentNode.style.display = 'block';
	kaishi = false;
	bgm1.pause();
}

game = new Game();
var startBtn = document.querySelector(".startBtn button");
startBtn.onclick = function(){
	startBtn.parentNode.style.display = 'none';
	game.init();
};
//暂定
var kaishi = false;
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function(){
	game.pause();
}
pauseBtn.onclick = function(){
	game.start();
}
// document.onkeydown = function(el){
// 	if(el.which == 32 && kaishi == true){
// 		game.pause();
// 		console.log('1');
// 		kaishi = false;
// 	}
// 	else if(el.which == 32 && kaishi==false){
// 		game.start();
// 		kaishi == true;
// 	}
// };
// $(function(){
//     //全屏
//     $("#fullScreen").on("click",function(){
//         fullScreen();
//     })
//     //退出全屏
//     $("#exitFullScreen").on("click",function(){
//         exitFullscreen();
//     })
// })

// //fullScreen()和exitScreen()有多种实现方式，此处只使用了其中一种
// //全屏
// function fullScreen() {
//     var element = document.documentElement;
//     if (element.requestFullscreen) {
//         element.requestFullscreen();
//     } else if (element.msRequestFullscreen) {
//         element.msRequestFullscreen();
//     } else if (element.mozRequestFullScreen) {
//         element.mozRequestFullScreen();
//     } else if (element.webkitRequestFullscreen) {
//         element.webkitRequestFullscreen();
//     }
// }

// //退出全屏 
// function exitFullscreen() {
//     if (document.exitFullscreen) {
//         document.exitFullscreen();
//     } else if (document.msExitFullscreen) {
//         document.msExitFullscreen();
//     } else if (document.mozCancelFullScreen) {
//         document.mozCancelFullScreen();
//     } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//     }
// }

// //监听window是否全屏，并进行相应的操作,支持esc键退出
// window.onresize = function() {
//     var isFull=!!(document.webkitIsFullScreen || document.mozFullScreen || 
//         document.msFullscreenElement || document.fullscreenElement
//     );//!document.webkitIsFullScreen都为true。因此用!!
//     if (isFull==false) {
//         $("#exitFullScreen").css("display","none");
//         $("#fullScreen").css("display","");
//     }else{
//         $("#exitFullScreen").css("display","");
//         $("#fullScreen").css("display","none");
//     }
// }
 