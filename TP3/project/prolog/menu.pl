% mainMenu
%   Print the main menu, with the game type options

mainMenu :-
    write('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n'),
    write('┃           Virus Wars          ┃\n'),
    write('┠───────────────────────────────┨\n'),
    write('┃                               ┃\n'),
    write('┃  (1) - Player vs Player       ┃\n'),
    write('┃  (2) - Player vs Computer     ┃\n'),
    write('┃  (3) - Computer vs Computer   ┃\n'),
    write('┃                               ┃\n'),
    write('┃  (0) - Exit                   ┃\n'),
    write('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n').


% aiMenu
%   Print the AI menu, with the game difficulty options

aiMenu :-
    write('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n'),
    write('┃           Difficulty          ┃\n'),
    write('┠───────────────────────────────┨\n'),
    write('┃                               ┃\n'),
    write('┃  (1) - Level 1                ┃\n'),
    write('┃  (2) - Level 2                ┃\n'),
    write('┃  (3) - Level 3                ┃\n'),
    write('┃                               ┃\n'),
    write('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n').

% dimMenu
%   Print the dimensions menu, for dimensions choosing

dimMenu :-
    write('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n'),
    write('┃        Board Dimensions       ┃\n'),
    write('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n').

% firstPlayerMenu
%   Print the first player menu, for choosing the player who will start the game

firstPlayerMenu(['user', 'computer']) :-
    write('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n'),
    write('┃         First Player          ┃\n'),
    write('┠───────────────────────────────┨\n'),
    write('┃                               ┃\n'),
    write('┃  (1) - Player ⨉   [You]       ┃\n'),
    write('┃  (2) - Player ◯   [Computer]  ┃\n'),
    write('┃                               ┃\n'),
    write('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n').

firstPlayerMenu(_) :-
    write('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n'),
    write('┃         First Player          ┃\n'),
    write('┠───────────────────────────────┨\n'),
    write('┃                               ┃\n'),
    write('┃  (1) - Player ⨉               ┃\n'),
    write('┃  (2) - Player ◯               ┃\n'),
    write('┃                               ┃\n'),
    write('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n').

% printPlayer
%   Print the player who is currently playing

printPlayer(Player) :-
    getPlayerSymbol(Player, Symbol),
    format('~n--------------- Player ~w ---------------~n', [Symbol]).

% cls
%   Clear the screen

cls:-write('\e[H\e[2J').
