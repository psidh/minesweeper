import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Bomb, GamepadIcon, Skull, Trophy, Dices } from 'lucide-react';

const BOARD_SIZE = 4;
const TILES = {
  BOMB: 0,
  SAFE_1: 1,
  SAFE_2: 2,
  SAFE_5: 5,
};

const createInitialBoard = () => {
  const validTiles = [TILES.BOMB, TILES.SAFE_1, TILES.SAFE_2, TILES.SAFE_5];

  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from(
      { length: BOARD_SIZE },
      () => validTiles[Math.floor(Math.random() * validTiles.length)]
    )
  );
};

const App = () => {
  const [board, setBoard] = useState(createInitialBoard());
  const [revealedBoard, setRevealedBoard] = useState(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false))
  );
  const [points, setPoints] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const savedHighScore = localStorage.getItem('minesweeperHighScore');
    return savedHighScore ? parseInt(savedHighScore, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver && points > highScore) {
      const newHighScore = Math.max(points, highScore);
      setHighScore(newHighScore);
      localStorage.setItem('minesweeperHighScore', newHighScore.toString());
    }
  }, [gameOver, points, highScore]);

  const startNewGame = () => {
    const newBoard = createInitialBoard();
    setBoard(newBoard);
    setRevealedBoard(
      Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false))
    );
    setPoints(0);
    setGameOver(false);
  };

  const revealNeighbors = (x, y, currentRevealedBoard, currentPoints) => {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    const newBoard = currentRevealedBoard.map((row) => [...row]);
    let newPoints = currentPoints;

    if (!newBoard[x][y]) {
      newBoard[x][y] = true;
      if (board[x][y] !== TILES.BOMB) {
        newPoints += board[x][y];
      }
    }

    directions.forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;

      if (
        newX >= 0 &&
        newX < BOARD_SIZE &&
        newY >= 0 &&
        newY < BOARD_SIZE &&
        !newBoard[newX][newY]
      ) {
        if (board[newX][newY] !== TILES.BOMB) {
          newBoard[newX][newY] = true;
          newPoints += board[newX][newY];
        }
      }
    });

    return { newBoard, newPoints };
  };

  const handleTileClick = (x, y) => {
    if (gameOver || revealedBoard[x][y]) return;

    if (board[x][y] === TILES.BOMB) {
      setRevealedBoard(
        Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(true))
      );
      toast.success(`Epic Score: ${points}!`, {
        icon: '🎯',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      setGameOver(true);
      toast.error('BOOM! Bomb Detonated!', {
        icon: <Bomb className="text-red-500" />,
        style: {
          borderRadius: '10px',
          background: '#ff6b6b',
          color: '#fff',
        },
      });

      return;
    }

    const { newBoard, newPoints } = revealNeighbors(
      x,
      y,
      revealedBoard,
      points
    );

    setRevealedBoard(newBoard);
    setPoints(newPoints);
  };

  const renderBoard = () => {
    return (
      <div className="grid grid-cols-4 gap-2 bg-gradient-to-br from-emerald-400 to-indigo-700 p-4 rounded-2xl shadow-2xl">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              onClick={() => handleTileClick(i, j)}
              className={`
                w-20 h-20 border-4 rounded-xl flex items-center justify-center cursor-pointer 
                transform transition-all duration-300 hover:scale-105 active:scale-95
                ${
                  revealedBoard[i][j]
                    ? cell === TILES.BOMB
                      ? 'bg-black border-black text-black animate-pulse'
                      : 'bg-green-400 border-green-600 text-white'
                    : 'bg-indigo-300 border-indigo-500 text-indigo-700'
                }
              `}
            >
              {revealedBoard[i][j] ? (
                cell === TILES.BOMB ? (
                  <p className="w-16 h-16 border border-neutral-600 rounded-lg flex flex-col items-center justify-center text-5xl">
                    💣
                  </p>
                ) : (
                  <span className="text-3xl font-bold">{cell}</span>
                )
              ) : (
                <Dices className="w-12 h-12 text-indigo-700" />
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 p-4">
      <Toaster position="top-right" />
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-2xl text-center">
        <h1 className="text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
          <GamepadIcon className="w-12 h-12" /> Gamer Minesweeper
        </h1>

        {gameOver ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black flex items-center justify-center gap-2 mb-4">
              <Skull className="w-10 h-10" /> Game Over
            </h2>
            {renderBoard()}
            <div className="flex justify-center items-center gap-4 mt-4">
              <p className="text-2xl font-bold text-white">
                Your Points: {points}
              </p>
              <p className="text-xl text-yellow-300 flex items-center gap-2">
                <Trophy className="w-8 h-8" /> High Score: {highScore}
              </p>
            </div>
            <button
              onClick={startNewGame}
              className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg 
              hover:bg-green-500 transition-all duration-300 font-medium
              flex items-center justify-center gap-2 mx-auto"
            >
              <Dices /> New Game
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {renderBoard()}
            <div className="flex justify-center items-center gap-4 mt-4">
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <GamepadIcon /> Points: {points}
              </div>
              <div className="text-xl text-yellow-300 flex items-center gap-2">
                <Trophy /> High Score: {highScore}
              </div>
            </div>
            <button
              onClick={startNewGame}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-full 
              hover:bg-blue-600 transition-all duration-300 
              flex items-center justify-center gap-2"
            >
              <Dices /> Restart Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
