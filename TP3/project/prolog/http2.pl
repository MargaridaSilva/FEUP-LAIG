:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_path)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server_files)).

:- use_module(library(lists)).

:- http_handler(root(game), prepReplyStringToJSON, []).						% Predicate to handle requests on server/game (for Prolog Game Logic)
:- http_handler(pub(.), serve_files_in_directory(pub), [prefix]).			% Serve files in /pub as requested (for WebGL Game Interface)
http:location(pub, root(pub), []).											% Location of /pub alias on server
user:file_search_path(document_root, '..').									% Absolute location of HTTP server document root
user:file_search_path(pub, document_root(pub)).								% location of /pub in relation to document root

:- consult('virus_wars.pl').

server(Port) :- http_server(http_dispatch, [port(Port)]).		% Start server on port Port

%Receive Request as String via POST
prepReplyStringToJSON(Request) :- 
		member(method(post), Request), !,						% if POST
        http_read_data(Request, Data, []),						% Retrieve POST Data
		processString(Data, Fields, Reply),						% Call processing predicate
		format('Content-type: application/json~n~n'),			% Reply will be JSON
		formatAsJSON(Fields, Reply).							% Send Reply as JSON

prepReplyStringToJSON(_Request) :-								% Fallback for non-POST Requests
		format('Content-type: text/plain~n~n'),					% Start preparing reply - reply type
		write('Can only handle POST Requests'),					% Standard Reply
		format('~n').											% End Reply

formatAsJSON(Fields, Reply):-
		write('{'),												% Start JSON Object
		writeJSON(Fields, Reply).								% Format content as JSON 
		
writeJSON([Prop], [Val]):-
	write('"'), write(Prop),
	write('":"'), write(Val), write('"}').						% Last element
writeJSON([Prop|PT], [Val|VT]):-
	write('"'), write(Prop),
	write('":"'), write(Val), write('", '),						% Separator for next element
	writeJSON(PT, VT).

processString([_Par=Val], Fields, R):-
        term_string([C|Tail], Val),									% Convert Parameter String to Prolog List
		fields(C, Fields),	
		response(C, R),										% Variables for Response
		append([C|Tail], R, ListR),									% Add extra Vars to Request
		Term =.. ListR,											% Create Term from ListR
		Term.													% Call the Term

response('play', R) :- R = [_NB].
response('moveUser', R) :- R = [_MT, _P, _NT, _NP].
response('moveComputer', R) :- R = [_MT, _P,  _NT, _NP].
response('checkWinner', R) :- R = [_W].

fields('play', [newBoard]).
fields('moveUser', [moveType, position,newTurn, newPlayer]).
fields('moveComputer', [moveType, position,  newTurn, newPlayer]).
fields('checkWinner', [winner]).

%---------------------------------------------

play(Dim, Board) :-
	createBoard(BoardCells, Dim),
	Board = BoardCells-Dim.

moveUser(Move, Board, Turn, Player, MoveType, Pos, NewTurn, NewPlayer) :-
	retractall(visited(_)),
	retractall(valid(_)),
	valid_move(Board, Player, Move), !,
	Pos = Move,
	getSymbol(Board, Move, Symbol), 
	getMoveType(Symbol, MoveType),
	makeMove(Board, Player, Move, _),
	nextPlayer(Player, NewPlayer, Turn, NewTurn).

moveUser(_, _, Turn, Player, "invalid", -1, Turn, Player).

moveComputer(Board, Turn, Player, AI, MoveType, Pos, NewTurn, NewPlayer) :-
	ai(Board, Player-Turn, AI, Pos),
	getSymbol(Board, Pos, Symbol), 
	getMoveType(Symbol, MoveType),
	makeMove(Board, Player, Pos, _),
	nextPlayer(Player, NewPlayer, Turn, NewTurn).

getMoveType('empty', 'mov').
getMoveType(_, 'zom').

checkWinner(Board, Winner) :-
	game_over(Board, 0, Winner).

checkWinner(_, -1).

:- set_random(seed(111)).
:- server(8081).