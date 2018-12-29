class MyGameInterface{

	start(Row, Col, game){
		let requestString="[play, ["+Row+","+Col+"]]";
		let request = new XMLHttpRequest();
		request.open('POST', '../../game', true);
		request.onload = function(data) {
			let response=JSON.parse(data.target.response);
			game.updateBoard(response.newBoard);
			game.dispatchComputerMoves();
			console.log(response);
		}
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send('requestString='+encodeURIComponent(requestString));
	}

	moveUser(Move, Board, Turn, Player, game){	
		let requestString="[moveUser,["+Move[0]+","+Move[1]+"],"+Board+","+Turn+","+Player+"]";
		console.log(requestString);
		let request = new XMLHttpRequest();
		request.open('POST', '../../game', true);
		request.onload = function(data) {
			let response=JSON.parse(data.target.response);
			//console.log(response);
			game.updateWithMovement(response.moveType,response.position, response.newTurn, response.newPlayer);
			
		}
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send('requestString='+encodeURIComponent(requestString));
	}	

	moveComputer(Board, Turn, Player, AI, game){
		let requestString="[moveComputer,"+Board+","+Turn+","+Player+","+AI+"]";
		console.log(requestString);
		let request = new XMLHttpRequest();
		request.open('POST', '../../game', true);
		request.onload = function(data) {
			let response=JSON.parse(data.target.response);
			game.updateWithMovement(response.moveType,response.position, response.newTurn, response.newPlayer);
			console.log(response);
		}
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send('requestString='+encodeURIComponent(requestString));
	}

	checkWinner(Board, game){
		let requestString="[checkWinner,"+Board+"]";
		let request = new XMLHttpRequest();
		request.open('POST', '../../game', true);
		request.onload = function(data) {
			let response=JSON.parse(data.target.response);
			game.updateWinner(response.winenr);
		}
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send('requestString='+encodeURIComponent(requestString));
	}
//to refactor
	postGameRequest(requestString, onSuccess, onError){
		let request = new XMLHttpRequest();
		request.open('POST', '../../../prolog/game', true);
		request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
		request.onerror = onError || function(){console.log("Error waiting for response");};
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send('requestString='+encodeURIComponent(requestString));			
	}
		
//Handle the JSON Reply
	handleReply(data){
		response=JSON.parse(data.target.response);
	}
}
