/* 
	游戏说明：
	1. 五子棋人人对战模式。
	2. 可无限悔棋，一直回到最开始。也可以无限撤销悔棋，回到最终状态。
	3. 鼠标悬停显示当前玩家的棋子
	4. 模拟棋子拿起、放下的声音，以及胜利之后的提示音
*/ 

var step = 0;														// 偶数步该黑棋走，奇数步该白棋走
var chessboardArr = new Array();				// 没有棋子值为0，有黑子为1，有白子为2
var piecesArr = new Array();						// 记录所有步骤（取的时候当成栈来使用）
var piecesRevokeArr = new Array();			// 记录所有撤销的步骤
var isEnd;															// 该局游戏是否结束
var isFalling = true;										// 棋子是否处于悬停在空中状态，true表示悬停，false表示已落子
var winer;
var notication = '';
var boardBox;
var boardContext;

window.onload = function(){
	boardBox = document.getElementById("board_box");
	boardContext = boardBox.getContext("2d");

	readyToStart(boardContext, "确定要来一局吗？");
}

function readyToStart(ctx, words) {
  var confirmWords = confirm(words);
  if(confirmWords) {
  	isEnd = false;
  	step = 0;
  	piecesArr = [];
		piecesRevokeArr = [];
  	// 启动背景音乐
  	getId('start_audio').play();
  	// 初始化棋盘格对应的数组
		for(var i = 0; i < 15; i++){
			chessboardArr[i] = new Array();
			for(var j = 0; j < 15; j++){
				chessboardArr[i][j] = 0;
			}
		}
  	updateWholeContext(ctx);
  } else{
  	document.write("刷新浏览器即可体验该游戏");
  }
}

function updateWholeContext(ctx){
	console.log('update whole context');
	boardBox.height = boardBox.height; 			// 清空整个画布
	// 绘制棋盘背景
	var img = new Image();
	img.src = "./images/chessboard.jpeg";
	img.onload = function(){
		ctx.drawImage(img, 0, 45, 560, 560);
		// 绘制所有棋子
		for(var i = 0; i < 15; i++){
			for(var j = 0; j < 15; j++){
				if(chessboardArr[i][j] > 0){
					painPiece(ctx, i, j);
				} 
			}
		}
	}
	notication = step % 2 > 0 ? "请白棋落子" : "请黑棋落子";
	// 绘制顶部提示语
	painNotication(ctx);
	// 显示悔棋按钮
	if(step > 0){
		// 绘制悔棋按钮
		ctx.fillStyle = "#d9b072";
		ctx.fillRect(585, 240, 120, 40);
		ctx.fillStyle = "#fff";
		ctx.fillText("悔棋", 645, 260);

		// 绘制撤销悔棋按钮
		ctx.fillStyle = "#d9b072";
		ctx.fillRect(585, 320, 120, 40);
		ctx.fillStyle = "#fff";
		ctx.fillText("撤销悔棋", 645, 340);
	}
}

function painPiece(ctx, x, y){
	var left = countDistance(x);
	var top = countDistance(y) + 45;
	ctx.fillStyle = chessboardArr[x][y] % 2 > 0 ? '#fff' : '#000';
	ctx.beginPath();
	ctx.arc(left, top, 17, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
}

function painNotication(ctx){
	boardContext.clearRect(0,0,560,45);
	ctx.font = "normal 18px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#000";
	ctx.fillText(notication, 270 , 22);
}

function play(event){
	// 开始落子
	if(!isEnd){
		var referenceX = document.getElementById('board_box').offsetLeft;
		var referenceY = document.getElementById('board_box').offsetTop;
		var offsetX = event.clientX - referenceX;
		var offsetY = event.clientY - referenceY - 45;
		// 如果点击的是悔棋按钮
		if(clickInner(offsetX, offsetY, 585, 195, 120, 40)){
			revoke();
			console.log("悔棋");
		}
		// 如果点击的是撤销悔棋按钮
		if(clickInner(offsetX, offsetY, 585, 275, 120, 40)){
			cancelRevoke();
			console.log("撤销悔棋");
		}
		var x = Math.round(offsetX / 35) - 1;
		var y = Math.round(offsetY / 35) - 1;
		console.log("落子为：（" + x + "，" + y + ")");
		
		// 棋盘边界检查
		if(!isOverChessboard(x, y)){
			if(chessboardArr[x][y] === 0){
				step ++;
				piecesArr.push({
					x: x,
					y: y
				});
				getId('tap_audio').play();		// 模拟落子的声音
				chessboardArr[x][y] = step % 2 > 0 ? 2 : 1;
				updateWholeContext(boardContext);
				if(checkResult(x, y)){
					// 中断背景音乐，提示胜利的声音
					getId('start_audio').pause();
					getId('start_audio').currentTime= 0;
					getId('gameover_audio').play();
					winer = step % 2 > 0 ? '黑棋' : '白旗';
					notication = winer + "已经胜利了！";
					painNotication(boardContext);
					isEnd = true;
					setTimeout(function(){
						readyToStart(boardContext, winer + "获胜了！" + "\n \n 您想再来一局吗？");
					}, 5000)
				};
			} else{
				console.log('此位置已放置了棋子');
			}
		}
	} else{
		console.log('该局游戏已经结束了');
	}
}

function isOverChessboard(x, y){
	if(x < 0 || y < 0 || x > 14 || y > 14){
		return true;
	}
	return false;
}

function countDistance(number){
	return 35 * (number + 1);
}

function clickInner(x, y, startX, startY, width, height){
	var otherX = startX + width;
	var otherY = startY + height;
	if(x >= startX && x <= otherX && y >= startY && y <= otherY){
			return true;
	}
	return false;
}

function revoke(){
	var lastPiece = piecesArr.pop();
	if(lastPiece){
		// 模拟悔棋声音
		getId('revoke_audio').play();
		piecesRevokeArr.push(lastPiece);
		chessboardArr[lastPiece.x][lastPiece.y] = 0;
		step --;
		updateWholeContext(boardContext);
	} else{
		alert("当前没有可悔棋的！");
	}
}


function cancelRevoke(){		// 撤销悔棋
	var lastPiece = piecesRevokeArr.pop();
	if(lastPiece){
		// 模拟悔棋声音
		getId('revoke_audio').play();
		piecesArr.push(lastPiece);
		chessboardArr[lastPiece.x][lastPiece.y] = step % 2 > 0 ? 1 : 2;
		step ++;
		updateWholeContext(boardContext);
	} else{
		alert("当前没有可撤销悔棋的！");
	}
}

function checkResult(x, y){
	var checkValue = step % 2 > 0 ? 2 : 1;
	var isSame;
	// 判断水平方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisX = x - i + j;
			if(isOverChessboard(thisX, y)){
				isSame = false;
				break;
			}
			if(chessboardArr[thisX][y] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	// 判断垂直方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisY = y - i + j;
			if(thisY < 0 || thisY > 14){
				isSame = false;
				break;
			}
			if(chessboardArr[x][thisY] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	// 判断斜上方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisX = x - i + j;
			var thisY = y + i - j;
			if(thisX < 0 || thisY < 0){
				isSame = false;
				break;
			}
			if(chessboardArr[thisX][thisY] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	// 判断斜下方向
	for(var i = 4; i >= 0; i--){
		isSame = true;
		for(var j = 0; j < 5; j++){
			var thisX = x - i + j;
			var thisY = y - i + j;
			if(thisX < 0 || thisY < 0){
				isSame = false;
				break;
			}
			if(chessboardArr[thisX][thisY] !== checkValue){
				isSame = false;
				break;				// 一旦发现此处不符合条件，强制退出当前循环
			}
		}
		if(isSame){
			return true;
		}
	}
	return false;
}

function getId(id){
	return document.getElementById(id);
}




