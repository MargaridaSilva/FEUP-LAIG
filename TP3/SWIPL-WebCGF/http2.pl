:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_path)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server_files)).
:- use_module(library(lists)).
:- consult('virus_wars.pl').

:- http_handler(root(game), prepReplyStringToJSON, []).						% Predicate to handle requests on server/game (for Prolog Game Logic)
:- http_handler(pub(.), serve_files_in_directory(pub), [prefix]).			% Serve files in /pub as requested (for WebGL Game Interface)
http:location(pub, root(pub), []).											% Location of /pub alias on server
user:file_search_path(document_root, '.').									% Absolute location of HTTP server document root
user:file_search_path(pub, document_root(pub)).								% location of /pub in relation to document root

server(Port) :- http_server(http_dispatch, [port(Port)]).		% Start server on port Port

%Receive Request as String via POST
prepReplyStringToJSON(Request) :- 
		member(method(post), Request), !,						% if POST
        http_read_data(Request, Data, []),						% Retrieve POST Data
		processString(Data, Reply),								% Call processing predicate
		format('Content-type: application/json~n~n'),			% Reply will be JSON
		formatAsJSON(Reply).									% Send Reply as JSON

prepReplyStringToJSON(_Request) :-								% Fallback for non-POST Requests
		format('Content-type: text/plain~n~n'),					% Start preparing reply - reply type
		write('Can only handle POST Requests'),					% Standard Reply
		format('~n').											% End Reply

formatAsJSON(Reply):-
		write('{'),												% Start JSON Object
		Fields = [newPlayer, newBoard, message],				% Response Field Names
		writeJSON(Fields, Reply).								% Format content as JSON 
		
writeJSON([Prop], [Val]):-
	write('"'), write(Prop),
	write('":"'), write(Val), write('"}').						% Last element
writeJSON([Prop|PT], [Val|VT]):-
	write('"'), write(Prop),
	write('":"'), write(Val), write('", '),						% Separator for next element
	writeJSON(PT, VT).

processString([_Par=Val], R):-
        term_string([C|Tail], Val),								% Convert Parameter String to Prolog List
		response(C, R),											% Variables for Response
		append(List, R, ListR),									% Add extra Vars to Request
		Term =.. ListR,											% Create Term from ListR
		Term.													% Call the Term

response('hello', [_T]).
response('play', [_NB]).
response('moveUser', [_MT, _POS, _NT, _NP, _W]).
response('moveComputer', [_MT, _POS, _NT, _NP, _W]).
response('checkWinner', [_B, _W]).

%---------------------------------------------
hello('hello', 'there').

play(Dim, Board) :- Board = [].

moveUser(Move, Board, Turn, Player, MoveType, Pos, NewTurn, NewPlayer) :-
	retractall(visited(_)),
	retractall(valid(_)),
	valid_move(Board, Player, Move), !,
	Pos = Move,
	getSymbol(Board, Move, Symbol), 
	getMoveType(Symbol, MoveType),
	NextPlayer(Player, NewPlayer, Turn, NewTurn).

moveUser(Move, Board, Turn, Player, "invalid", -1, -1, -1).

getMoveType('empty', 'mov').
getMoveType(_, 'zom').

checkWinner(Board, Winner) :-
	gameOver(Board, 0, Winner).


play(Player, Board, Play, NextPlayer, NewBoard, Message):-		% Example play predicate
	% Game Logic
	Board=[[_|A]|B], NewBoard=[[Play|A]|B],						% Example - changes [1,1] to Play
	next(Player, NextPlayer),									% Change Player
	Message = "Move Validated".									% Add some message (Game Over / Invalid Move / ...)
	
next(1,0).
next(0,1).

:- server(8081).