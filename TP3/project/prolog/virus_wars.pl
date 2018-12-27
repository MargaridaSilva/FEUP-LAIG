:- consult('display.pl').
:- consult('board.pl').
:- consult('input.pl').
:- consult('menu.pl').
:- consult('ai.pl').
:- dynamic('visited/1').
:- dynamic('aiLevel/1').
:- dynamic('playerType/2').

% =====
% Play
% =====

% play
% Start the game

play :- 
		getGameInfo(PlayersType, FirstPlayer, AI, Dim),
		storeGameInfo(PlayersType, AI),
		createBoard(BoardCells, Dim),
		Board = BoardCells-Dim,
		game(FirstPlayer, Board, 4).

% storeGameInfo(+[Player1Type, Player2Type], AI)
%	Store the game settings before it starts

storeGameInfo([Player1Type, Player2Type], AI) :-
		asserta(playerType(0, Player1Type)),
		asserta(playerType(1, Player2Type)),
		asserta(aiLevel(AI)).

% =====
% Game
% =====

% game(+Player, Board, Turn)
%	Unfold game with Board in a Turn of a Player

game(Player, Board, _) :- 
		write(Player),
		game_over(Board, Player, Winner),
		getPlayerSymbol(Winner, Symbol),
		display_game(Player, Board),
		format('Player ~w won.~n', [Symbol]).

game(PreviuosPlayer, Board, Turn) :- 
		nextPlayer(PreviuosPlayer, Player, Turn, NewTurn),
		display_game(Player, Board),
		playerType(Player, PlayerType),
		move(Player-Turn, PlayerType, Board, NewBoard),
		game(Player, NewBoard, NewTurn).

% game_over(+Board, +Player, +Winner)
%	Check if game has ended for Player and returns the Winner
game_over(Board, Player, Player):-
		opponent(Player, Opponent),
		\+(valid_moves(Board, Opponent, _)).

game_over(Board, Player, Opponent):-
		\+(valid_moves(Board, Player, _)), 
		opponent(Player, Opponent).

% =====
% Move
% =====

% move(+Player, +PlayerType, +Board, -NewBoard) :-
%	Perform a movement of Player in Board, returning the NewBoard

move(Player-_, 'user', Board, NewBoard):-
		repeat,
		playInput(Board, Move),
		retractall(visited(_)),
		retractall(valid(_)),
		(valid_move(Board, Player, Move) , ! ; write('[Invalid Move]\n\n'), fail),
		makeMove(Board, Player, Move, NewBoard).
		

move(Player-Turn, 'computer', Board, NewBoard):- 
		aiLevel(AILevel),
		choose_move(Board, Player-Turn, AILevel, Move),
		makeMove(Board, Player, Move, NewBoard).


% ==========
% Make Move
% ==========

% makeMove(+Board, +Player, +Move, -NewBoard)
%   Responsible for making a move and return the next board
makeMove(Board, Player, Move, NewBoard):- 
		getSymbol(Board, Move, CurrentSymbol), 
		getNewSymbol(Player, CurrentSymbol, NewSymbol),
		setSymbol(Board, Move, NewSymbol, NewBoard).


% ===========
% New Symbol
% ===========

% getNewSymbol(+Player, +CurrentSymbol, -NewSymbol)
%	Get the new symbol for a player acording to a previous symbol

getNewSymbol(Player, 'empty', NewSymbol):-
	playerValue(Player, NewSymbol).

getNewSymbol(Player, CurrentSymbol, NewSymbol):-
	opponent(Player, Opponent),
	playerValue(Opponent, OpponentSymbol),
	CurrentSymbol = OpponentSymbol,
	playerValueZ(Player, NewSymbol).


% ============
% Choose Move
% ============

% choose_move(+Board, +Player, +AILevel, -Move)
%	Choose the best Move for a Player in a Board, according to the AILevel 

choose_move(Board, Player-_, 1, Move) :-
	valid_moves(Board, Player, ListOfMoves),
    length(ListOfMoves, Len),
    random(0, Len, Random),
    nth0(Random, ListOfMoves, Move).

choose_move(Board, Player-Turn, 2, Move):-
	ai(Board, Player-Turn, 1, Move).

choose_move(Board, Player-Turn, 3, Move):-
	ai(Board, Player-Turn, 3, Move).


% ===========
% Check Move
% ===========

% valid_move(+Board, +Player, Move)
%	Evaluates if Move is a valid move for Player in Board

valid_move(Board, Player, Move) :-
	(getSymbol(Board, Move, 'empty') ; (opponent(Player, Opponent), playerValue(Opponent, OpponentSymbol), getSymbol(Board, Move, OpponentSymbol))),
	checkMoveChain(Player, Move, Board).

% checkMoveChain(+Player, +Position, Board)
%	Check if a position is in a valid chain of zombies for Player

% checkMoveChain(_, [Row, Col], _) :-
% 	visited([Row, Col]),
% 	valid([Row, Col]),!.

checkMoveChain(Player, [Row, Col], Board) :- 
	not(visited([Row, Col])),
	asserta(visited([Row, Col])),

	playerValue(Player, Symbol),
	playerValueZ(Player, SymbolZ),

	between(-1, 1, ROffset), between(-1, 1, COffset),
	not((ROffset = 0, COffset = 0)),
	NRow is (Row + ROffset), 
	NCol is (Col + COffset), 
	isPositionValid(Board, [NRow, NCol]),
	(getSymbol(Board, [NRow, NCol], Symbol) 
	; 
	(getSymbol(Board, [NRow, NCol], SymbolZ), checkMoveChain(Player, [NRow, NCol], Board))),
	asserta(valid([NRow, NCol])).

% valid_moves(+Board, +Player, -ListOfMoves).
%	Return the list of valid moves in ListOfMoves
valid_moves(Board, Player, ListOfMoves) :-
	retractall(visited(_)),
	retractall(valid(_)),
    setof(Move, valid_move(Board,Player, Move), ListOfMoves), !.



% ============
% Utilities
% ============

% opponent(+Player -Opponent)
%	Get the Opponent of a Player

opponent(Player, Opponent) :- Opponent is (Player + 1) mod 2.

% nextPlayer(+PlayerIn, -NewPlayer, +Turn, -NewTurn)
%	Evaluates which is the next player to play and updates the remaining moves of the Turn

nextPlayer(PlayerIn, NewPlayer, 1, 3) :- NewPlayer is (PlayerIn + 1) mod 2.
nextPlayer(PlayerIn, PlayerIn, Turn, NewTurn) :- NewTurn is Turn - 1.