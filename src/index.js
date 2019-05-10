import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props){
    return (
        <button
            className="square"
            onClick={props.onClick}
        >
            {props.isHighlighted ? (<mark>{props.value}</mark>) : (<label>{props.value}</label>)}
        </button>
      );
}
  
class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i].value}
                isHighlighted={this.props.squares[i].isHighlighted}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let result = [];

        for (let i = 0; i < 3; i++){
            let squareElements = [];

            for (let j = 0; j < 3; j++){
                squareElements.push(this.renderSquare(i * 3 + j));
            }

            result.push(
                (<div key={i} className="board-row">
                    {squareElements}
                </div>)
            );
        }

        return (
            <div>
                {result}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            history: [
                {
                    squares: Array(9).fill({value: null, isHighlighted: false}),
                    xIsNext: true,
                    selected: null,
                    winner: null
                }
            ],
            stepNumber: 0,
            isAsc: true
        };
    }

    handleClick(i){
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.map(function(s){
            return { value: s.value, isHighlighted: s.isHighlighted }
        });

        if (current.winner || squares[i].value){
            return;
        }

        squares[i].value = current.xIsNext ? 'X' : 'O';

        const winnerLine = calculateWinnerLine(squares);

        if (winnerLine){
            squares[winnerLine[0]].isHighlighted = true;
            squares[winnerLine[1]].isHighlighted = true;
            squares[winnerLine[2]].isHighlighted = true;
        }

        this.setState({
            history: history.concat([{
                squares: squares,
                xIsNext: !current.xIsNext,
                selected: i,
                winner: winnerLine ? squares[i].value : null
            }]),
        stepNumber: history.length });
    }

    jumpTo(i){
        this.setState({
            stepNumber: i
        });
    }

    toggle(){
        this.setState({isAsc: !this.state.isAsc});
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const sortCoef = this.state.isAsc ? 1 : -1;

        let moves = history.map((h, i) => {
            const descr = h.selected != null ? `Go to cell (${(h.selected % 3) + 1}, ${Math.floor(h.selected / 3) + 1})` : 'Go to game start';

            return (
                <li key={i}>
                    <button onClick={() => this.jumpTo(i)}>
                        {i === this.state.stepNumber ? (<b>{descr}</b>) : (<label>{descr}</label>)}
                    </button>
                </li>
            )
        }).sort((x, y) => sortCoef * (x.key - y.key));

        let status;
        if (current.winner) {
            status = 'Winner: ' + current.winner;
        } else if (this.state.stepNumber == 9){
            status = 'Result is a draw!';
        }
        else {
            status = 'Next player: ' + (current.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    {
                        this.state.isAsc ? (<ol>{moves}</ol>) : (<ol reversed>{moves}</ol>)
                    }
                    <button onClick={() => this.toggle()}>
                        Toggle in {this.state.isAsc ? 'DESC' : 'ASC'}
                    </button>
                </div>
            </div>
        );
    }
}

function calculateWinnerLine(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a].value && squares[a].value === squares[b].value && squares[a].value === squares[c].value) {
            return [a, b, c];
        }
    }

    return null;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
