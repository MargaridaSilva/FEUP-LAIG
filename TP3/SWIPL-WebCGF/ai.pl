% ai(+Board, +Player, +Lvl, -Move)
%   Generate move acording to the board, the active player, and the level of difficulty

ai(Board, Player, Lvl, Move) :-
    minimax(Board, Player, Player, Move, _Val, Lvl).


% minimax(+Board, +Player, +MaxPlayer, -Move, -Val, +Lvl)
%   Generate move and its value acording to the board, the active player, the player whose move is to be maximized, and the level of difficulty

minimax(Board, Player-_, MaxPlayer, _, Val, 0) :-
    value(Board, Player, MaxPlayer, Val).

minimax(Board, Player-Turn, MaxPlayer, BestNextMove, Val, Lvl) :-
    Lvl1 is Lvl - 1,
    valid_moves(Board, Player, MovesList),
    best(Board, MovesList, Player-Turn, MaxPlayer, BestNextMove, Val, Lvl1),
    !.

minimax(_, Player-_, MaxPlayer, _, Val, _) :-
    value_no_moves(_, Player, MaxPlayer, Val).

% best(+Board, +MovesList, +Player, +MaxPlayer, -BestNextMove, -BestVal, +Lvl)
%   Choose the best move from a list of possibilities, along with its value

best(Board, MovesList, Player-Turn, MaxPlayer, BestNextMove, BestVal, Lvl) :-
    setof(
        Val-Move,
        (   
            member(Move, MovesList),
            makeMove(Board, Player, Move, NewBoard),
            nextPlayer(Player, NewPlayer, Turn, NewTurn),
            minimax(NewBoard, NewPlayer-NewTurn, MaxPlayer, _, Val, Lvl)
        ), 
        ScoreList
        ),
    
    (Player = MaxPlayer, !, 
        Index is 0
        ; 
        length(ScoreList, ScoreListLen),
        Index is ScoreListLen - 1
    ),

    nth0(Index, ScoreList, BestVal-_),
    findall(Move, member(BestVal-Move, ScoreList), BestMoves),
    length(BestMoves, BestMovesLen),
    random(0, BestMovesLen, N),
    nth0(N, BestMoves, BestNextMove).

% value(+Board, +Player, +MaxPlayer, -Val)
% Calculate the value of a Board, from the prespective of a Player
value(Board, Player, MaxPlayer, Val) :- 
    value_move(Board, Player, MaxPlayer, Val) 
    ; 
    value_no_moves(Board, Player, MaxPlayer, Val).

value_move(Board, Player, _, Val):-
    valid_moves(Board, Player, MovesList), 
    length(MovesList, L), Val = L. 

value_no_moves(_, Player, MaxPlayer, Val):-
    (Player = MaxPlayer, !, Val = -100; Val = 100).