% createBoard(+Board, +Dim)
%   Create a board with dimension Dim
createBoard(Board, [Rows, Cols]) :-
            findall(cell(R, C, 'empty'), (between(1, Rows, R), between(1, Cols, C)),  Board1),
            setSymbol(Board1-_, [Rows, 1], 'bAliv',Board2-_),
            setSymbol(Board2-_, [1, Cols], 'rAliv',Board3-_),
            Board = Board3.

% getSymbol(+Board, +Position, -Value)
%   Get the value at a certain position of a Board

getSymbol(BoardCell-_Dim, [Row, Col], Value) :- 
            member(cell(Row, Col, Value), BoardCell).

% setSymbol(+Board, +Position, +Value)
%   Set the value at a position of a Board

setSymbol(BoardCell-Dim, [Row, Col], Value, BoardOut-Dim) :- 
            select(cell(Row,Col,_), BoardCell, BoardRem), 
            append(BoardRem, [cell(Row, Col, Value)], BoardOut).

% isPositionValid(+Board, +Position)
%   Evaluate if a position is within the bounds of a Board

isPositionValid(_BoardCell-[Rows, Cols], [Row, Col]) :-
    Row >= 1, Row =< Rows, Col >=1, Col =< Cols.
