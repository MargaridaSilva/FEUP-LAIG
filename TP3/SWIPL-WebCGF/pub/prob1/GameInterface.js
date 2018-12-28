let response = [];

function play(Row, Col){
	let requestString="[play, ["+Row+","+Col+"]]";
	gettingInfo=true;
	postGameRequest(requestString, handleReply);
	return response;
}

function moveUser(Move, Board, Turn, Player){
	let requestString="[moveUser, ["+Move+","+Board+","+Turn+","+Player+"]";
	postGameRequest(requestString, handleReply);
	return response;
}

function moveComputer(Board, Turn, Player, AI){
	let requestString="[moveComputer, ["+Board+","+Turn+","+Player+","+AI+"]";
	postGameRequest(requestString, handleReply);
	return response;
}

function checkWinner(Board){
	let requestString="[checkWinner, ["+Board+"]";
	postGameRequest(requestString, handleReply);
	return response.winner;
}

function postGameRequest(requestString, onSuccess, onError){
	let request = new XMLHttpRequest();
	request.open('POST', '../../prolog/game', true);
	request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
	request.onerror = onError || function(){console.log("Error waiting for response");};
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send('requestString='+encodeURIComponent(requestString));			
}

/*FOR TESTING*/
function makeRequest()
{
	
	// Compose Request String
	/* TEST PLAY */
	//let requestString = "[play, [3,3]]";
	/* TEST MOVE USER */
	//let requestString ="[moveUser,[2,2],[cell(1,1,empty),cell(1,2,empty),cell(2,1,empty),cell(2,2,empty),cell(2,3,empty),cell(3,2,empty),cell(3,3,empty),cell(3,1,bAliv),cell(1,3,rAliv)]-[3,3],1,1]";
	//let requestString="[moveUser,[3,1],[cell(1,1,empty),cell(1,2,empty),cell(2,1,empty),cell(2,3,empty),cell(3,2,empty),cell(3,3,empty),cell(3,1,bAliv),cell(1,3,rAliv),cell(2,2,rAliv)]-[3,3],3,1]";
	/* TEST MOVE COMPUTER */
	//let requestString = "[moveComputer,[cell(1,1,empty),cell(1,2,empty),cell(2,1,empty),cell(2,2,empty),cell(2,3,empty),cell(3,2,empty),cell(3,3,empty),cell(3,1,bAliv),cell(1,3,rAliv)]-[3,3],1,1,1]";
	/* TEST CHECK WINNER */
	//let requestString="[checkWinner, [cell(1,1,empty),cell(1,2,empty),cell(2,1,empty),cell(2,3,empty),cell(3,2,empty),cell(3,3,empty),cell(1,3,rAliv),cell(2,2,rAliv),cell(3,1,rDead)]-[3,3]]";
	//postGameRequest(requestString, handleReply);
}
			
//Handle the JSON Reply
function handleReply(data){
	response=JSON.parse(data.target.response);
}