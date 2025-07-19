import React, { useState } from 'react';
import './App.css';

// Color variables for theme
const COLORS = {
  primary: '#2196f3',
  secondary: '#f5f5f5',
  accent: '#ff9800',
  boardBG: '#fff',
  border: '#e9ecef',
  x: '#2196f3',
  o: '#ff9800',
};

// PUBLIC_INTERFACE
function TicTacToe() {
  /** The core Tic Tac Toe hook and game logic. */
  const emptyBoard = Array(9).fill(null);
  const [squares, setSquares] = useState(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true); // X starts always
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Check winner/draw logic every move
  React.useEffect(() => {
    const win = calculateWinner(squares);
    if (win) {
      setWinner(win);
      setGameOver(true);
    } else if (squares.every(square => square)) {
      setWinner(null); // Draw
      setGameOver(true);
    }
  }, [squares]);

  // PUBLIC_INTERFACE
  function handleClick(i) {
    if (squares[i] || gameOver) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(emptyBoard);
    setXIsNext(true);
    setGameOver(false);
    setWinner(null);
  }

  const status = gameOver
    ? winner === null
      ? 'Draw!'
      : `Winner: ${winner}`
    : `Current turn: ${xIsNext ? 'X' : 'O'}`;

  // Render squares/board
  function renderSquare(i) {
    return (
      <button
        className="square"
        style={{
          color:
            squares[i] === 'X'
              ? COLORS.x
              : squares[i] === 'O'
              ? COLORS.o
              : COLORS.primary,
        }}
        onClick={() => handleClick(i)}
        aria-label={
          squares[i]
            ? `Cell ${i + 1}, ${squares[i]}`
            : `Cell ${i + 1}, empty. Click to play ${
                xIsNext ? 'X' : 'O'
              }`
        }
        disabled={!!squares[i] || gameOver}
      >
        {squares[i]}
      </button>
    );
  }

  return (
    <div className="ttt-container">
      <h1 className="ttt-title">Tic Tac Toe</h1>
      <div className="ttt-status" data-testid="ttt-status">
        {status}
      </div>
      <div className="ttt-board" role="grid">
        {[0, 1, 2].map(row => (
          <div className="ttt-row" role="row" key={row}>
            {[0, 1, 2].map(col =>
              renderSquare(row * 3 + col)
            )}
          </div>
        ))}
      </div>
      <div className="ttt-controls">
        <button className="ttt-btn" onClick={handleRestart}>
          Restart Game
        </button>
      </div>
      <div className="ttt-footer">
        <span>
          <span style={{ color: COLORS.primary, fontWeight: 500 }}>X</span> = Player 1
        </span>
        <span style={{ marginLeft: 16 }}>
          <span style={{ color: COLORS.accent, fontWeight: 500 }}>O</span> = Player 2
        </span>
      </div>
    </div>
  );
}

// Utility to determine winner
function calculateWinner(sq) {
  /** Returns 'X', 'O', or null. */
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
  for (const [a, b, c] of lines) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return sq[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  /** Main App wrapper for the game, sets up the page structure and theme. */
  // Set up CSS theme variables (light mode)
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ttt-primary', COLORS.primary);
    root.style.setProperty('--ttt-secondary', COLORS.secondary);
    root.style.setProperty('--ttt-accent', COLORS.accent);
    root.style.setProperty('--ttt-board-bg', COLORS.boardBG);
    root.style.setProperty('--ttt-border', COLORS.border);
    root.style.setProperty('--ttt-x', COLORS.x);
    root.style.setProperty('--ttt-o', COLORS.o);
  }, []);
  return (
    <div className="App" style={{ background: COLORS.secondary, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <TicTacToe />
      </div>
    </div>
  );
}

export default App;
