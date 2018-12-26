% ==========
% Game Info
% ==========

% getGameInfo(-PlayersType, -FirstPlayer, -AILevel, -Dim)
%   Collect the information necessary to start the game - type of players, who starts, AI level and Board dimension

getGameInfo(PlayersType, FirstPlayer, AILevel, Dim) :-
    getPlayersType(PlayersType),
    getFirstPlayer(FirstPlayer, PlayersType),
    getAILevel(AILevel, PlayersType),
    getDim(Dim).

% ============
% Player Type
% ============

% getPlayersType(+PlayersType)
%   Get from user the information of which is the type of the game

getPlayersType(PlayersType) :-
    mainMenu,
	mainMenuInput(GameType),
	playersType(GameType, PlayersType).
    
% mainMenuInput(+N) :-
%   Collect from user the main menu option

mainMenuInput(N) :-
    input('Option', [N], checkMainMenuInput, 'Invalid Input').

checkMainMenuInput([N]) :-
    integer(N),
    N>=0,
    N=<3.

% playersType(+PlayersType, -Players) :-
%   Translate de internal players type representation to an array of strings

playersType(1, ['user', 'user']).
playersType(2, ['user', 'computer']).
playersType(3, ['computer', 'computer']).


% =============
% First Player
% =============

% getFirstPlayer(+FirstPlayer, +PlayersType)
%   Get from user the information of who is the first player to play

getFirstPlayer(FirstPlayer, PlayersType) :-
    firstPlayerMenu(PlayersType),
    firstPlayerMenuInput(FirstPlayer).

% firstPlayerMenuInput(+FirstPlayer) :-
%   Collect from user the first player menu option

firstPlayerMenuInput(FirstPlayer) :-
    input('Option', [PlayerOption], checkPlayerInput, 'Invalid Input'),
    FirstPlayer is PlayerOption - 1.

% checkPlayerInput(+Player)
%   Check if the firstPlayerMenu input is valid

checkPlayerInput([Player]) :-
    integer(Player),
    Player>=1,
    Player=<2.

% ========
% AI Level
% ========

% getAILevel(+AILevel, +PlayersType)
%   Get from user the information of which is the AI level of the computers movements

getAILevel(0, ['user', 'user']).
getAILevel(AILevel, _PlayersType) :-
    aiMenu,
	aiMenuInput(AILevel).

% aiMenuInput(+N) :-
%   Collect from user the ai menu option

aiMenuInput(N) :-
    input('Option', [N], checkMenuInput, 'Invalid Input').

% checkMenuInput(+Player)
%   Check if the main Menu and ai level input is valid

checkMenuInput([N]) :-
    integer(N),
    N>=1,
    N=<3.

% aiType(+AILevel, -level)
%   Translate the ai leve internal representation to string

aiType(1, 'level1').
aiType(2, 'level2').
aiType(3, 'level3').

% ================
% Board Dimension
% ================

% getDim(-Dim)
%   Get from user the information of the dimension of the board

getDim(Dim) :-
    dimMenu,
    dimInput(NRows, NCols),
    Dim = [NRows, NCols].

% dimInput(+N) :-
%   Collect from user the dim menu values

dimInput(NRows, NCols) :-
    input('Number of Rows', [NRows], checkDim, 'Invalid number of rows'),
    input('Number of Columns', [NCols], checkDim, 'Invalid number of columns').

% checkDim(+Player)
%   Check if the dim Menu input is valid

checkDim([N]) :- 
    integer(N),
    N > 1, 
    N < 15.


% ===========
% Move input
% ===========

% playInput(+Board, -Dim)
%   Collect from user the information of the next move wanted

playInput(_-[NRows, NCols], [Row, Col]) :-
    input('Row', [Row, NRows], checkRows, 'Invalid Row'),
    input('Col', [CCol, NCols], checkCols, 'Invalid Col'),
    char_code('a', CodeA),
    char_code(CCol, CodeC),
    Col is CodeC - CodeA + 1.

% checkRows(+[Row, NRows])
%   Check if the row value collected from user is valid

checkRows([Row, NRows]) :-
    integer(Row),
    Row>=1,
    Row=<NRows.

% checkCols(+[Col, Cols])
%   Check if the col value collected from user is valid

checkCols([Col, NCols]) :-
    atom(Col),
    atom_length(Col, Len),
    Len = 1,
    char_type(Col, lower),
    char_code('a', CodeA),
    char_code(Col, CodeC),
    CodeC >= CodeA,
    CodeC =< CodeA + NCols.


% ===============
% Input template
% ===============

% input(+Prompt, +[Value|Rest], CheckPred, ErrorMsg)
%   Collect generic input with Prompt message, and check with CheckPred its validity, presenting ErrorMsg is case of failure

input(Prompt, [Value|Rest], CheckPred, ErrorMsg) :-
    repeat,
    format('~w: \n', [Prompt]),
    
    (   catch(read(Value), _, fail), call(CheckPred, [Value|Rest])
    ->  true, !
    ;   format('ERROR: ~w.~n', [ErrorMsg]),
        fail
    ).