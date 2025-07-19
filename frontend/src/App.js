import React, { useState, useEffect } from 'react';
import './App.css';
import AIChat from "./AIChat";

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

/**
 * Simple AI for Tic Tac Toe
 * Picks center if available, then wins/blocks if possible, otherwise picks random empty.
 */
function getAIMove(squares, aiMark = 'O', humanMark = 'X') {
  function findLine(mark) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      const line = [squares[a], squares[b], squares[c]];
      if (
        line.filter(x => x === mark).length === 2 &&
        line.some(x => x === null)
      ) {
        if (!squares[a]) return a;
        if (!squares[b]) return b;
        if (!squares[c]) return c;
      }
    }
    return null;
  }
  let winMove = findLine(aiMark);
  if (winMove !== null) return winMove;
  let blockMove = findLine(humanMark);
  if (blockMove !== null) return blockMove;
  if (!squares[4]) return 4; // center
  const corners = [0, 2, 6, 8].filter(i => !squares[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const empty = squares.map((v, i) => v ? null : i).filter(i => i !== null);
  if (empty.length) return empty[Math.floor(Math.random() * empty.length)];
  return null;
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
  /**
   * Main App wrapper for the game and AIChat.
   * Hoists the game state for passing to the AIChat, and keeps single source of truth for the game & mode management.
   */
  // Set up CSS theme variables (light mode)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ttt-primary', COLORS.primary);
    root.style.setProperty('--ttt-secondary', COLORS.secondary);
    root.style.setProperty('--ttt-accent', COLORS.accent);
    root.style.setProperty('--ttt-board-bg', COLORS.boardBG);
    root.style.setProperty('--ttt-border', COLORS.border);
    root.style.setProperty('--ttt-x', COLORS.x);
    root.style.setProperty('--ttt-o', COLORS.o);
  }, []);

  // Game state - hoist ALL state needed, including mode
  const emptyBoard = Array(9).fill(null);
  const [squares, setSquares] = useState(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [mode, setMode] = useState('pvp'); // "pvp" or "pvai"
  const [aiThinking, setAIThinking] = useState(false);

  const isAI = mode === 'pvai';
  const humanMark = 'X';
  const aiMark = 'O';

  // Evaluate for winner/draw after every move
  useEffect(() => {
    const win = calculateWinner(squares);
    if (win) {
      setWinner(win);
      setGameOver(true);
    } else if (squares.every(square => square)) {
      setWinner(null);
      setGameOver(true);
    } else {
      setWinner(null);
      setGameOver(false);
    }
  }, [squares]);

  // AI move effect (PvAI, AI turn only, game running, not thinking)
  useEffect(() => {
    if (isAI && !gameOver && !xIsNext && !aiThinking) {
      setAIThinking(true);
      setTimeout(() => {
        const aiMove = getAIMove(squares, aiMark, humanMark);
        if (aiMove !== null) {
          const nextSquares = squares.slice();
          nextSquares[aiMove] = aiMark;
          setSquares(nextSquares);
          setXIsNext(true);
        }
        setAIThinking(false);
      }, 400);
    }
    // eslint-disable-next-line
  }, [xIsNext, isAI, gameOver, aiThinking, squares, aiMark, humanMark]);

  // PUBLIC_INTERFACE
  function handleClick(i) {
    if (squares[i] || gameOver) return;
    // PvAI: Only allow click if it's human's turn
    if (isAI && !xIsNext) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? humanMark : aiMark;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(emptyBoard);
    setXIsNext(true);
    setGameOver(false);
    setWinner(null);
    setAIThinking(false);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    const newMode = e.target.value;
    setMode(newMode);
    setSquares(emptyBoard);
    setXIsNext(true);
    setGameOver(false);
    setWinner(null);
    setAIThinking(false);
  }

  const status = gameOver
    ? winner === null
      ? 'Draw!'
      : `Winner: ${winner}${isAI ? (winner === aiMark ? ' (AI)' : '') : ''}`
    : isAI
      ? aiThinking
        ? 'AI is thinking...'
        : `Your turn (${xIsNext ? humanMark : aiMark})`
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
            : `Cell ${i + 1}, empty. Click to play ${xIsNext ? (isAI ? humanMark : 'X') : (isAI ? aiMark : 'O')}`
        }
        disabled={!!squares[i] || gameOver || (isAI && !xIsNext)}
      >
        {squares[i]}
      </button>
    );
  }

  return (
    <div className="App" style={{ background: COLORS.secondary, minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
        {/* Game board and controls */}
        <div className="ttt-container">
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <div style={{ marginBottom: 14 }}>
            <label style={{ marginRight: 12, fontWeight: 500 }}>Mode:</label>
            <select value={mode} onChange={handleModeChange} style={{ fontSize: '1.08rem', borderRadius: 6, padding: '6px 12px', marginBottom: 4 }}>
              <option value="pvp">Player vs Player</option>
              <option value="pvai">Player vs AI</option>
            </select>
          </div>
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
            {mode === 'pvp' ? (
              <>
                <span>
                  <span style={{ color: COLORS.primary, fontWeight: 500 }}>X</span> = Player 1
                </span>
                <span style={{ marginLeft: 16 }}>
                  <span style={{ color: COLORS.accent, fontWeight: 500 }}>O</span> = Player 2
                </span>
              </>
            ) : (
              <>
                <span>
                  <span style={{ color: COLORS.primary, fontWeight: 500 }}>X</span> = <strong>You</strong>
                </span>
                <span style={{ marginLeft: 16 }}>
                  <span style={{ color: COLORS.accent, fontWeight: 500 }}>O</span> = <strong>AI</strong>
                </span>
              </>
            )}
          </div>
        </div>
        {/* AI Chat box */}
        <AIChat
          board={squares}
          status={status}
        />
      </div>
    </div>
  );
}

export default App;
