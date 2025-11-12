import { useState, useEffect } from "react";
import { X as CloseIcon, RotateCcw, Trophy } from "lucide-react";
import toast from "react-hot-toast";

const TicTacToeGame = ({ game, onMove, currentUser, onClose }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (game?.board) {
      setBoard(game.board);
      setWinner(game.winner);
      setIsDraw(game.isDraw);
    }
  }, [game]);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = async (index) => {
    if (board[index] || winner || isDraw || isLoading) return;

    const isPlayerX = game?.players?.[0]?._id === currentUser._id;
    const isPlayerO = game?.players?.[1]?._id === currentUser._id;
    const currentSymbol = isPlayerX ? 'X' : 'O';

    if (!isPlayerX && !isPlayerO) {
      toast.error("You're not a player in this game");
      return;
    }

    if (game?.currentTurn !== currentUser._id) {
      toast.error("It's not your turn!");
      return;
    }

    setIsLoading(true);
    try {
      const newBoard = [...board];
      newBoard[index] = currentSymbol;
      setBoard(newBoard);

      const gameWinner = checkWinner(newBoard);
      const gameDraw = !gameWinner && newBoard.every(cell => cell !== null);

      await onMove({
        position: index,
        winner: gameWinner,
        isDraw: gameDraw
      });

      if (gameWinner) {
        setWinner(gameWinner);
        toast.success(gameWinner === currentSymbol ? "You won! 🎉" : "You lost!");
      } else if (gameDraw) {
        setIsDraw(true);
        toast("It's a draw!");
      }
    } catch (error) {
      toast.error("Failed to make move");
      if (game?.board) setBoard(game.board);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
  };

  const renderCell = (index) => {
    const value = board[index];
    return (
      <button
        key={index}
        onClick={() => handleClick(index)}
        disabled={!!value || !!winner || isDraw || isLoading}
        className={`
          w-20 h-20 border-2 border-base-300 bg-base-200 
          hover:bg-base-300 transition-colors rounded-lg
          flex items-center justify-center text-3xl font-bold
          ${value === 'X' ? 'text-primary' : 'text-secondary'}
          ${!value && !winner && !isDraw ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
      >
        {value}
      </button>
    );
  };

  const isPlayerX = game?.players?.[0]?._id === currentUser._id;
  const isPlayerO = game?.players?.[1]?._id === currentUser._id;
  const playerSymbol = isPlayerX ? 'X' : isPlayerO ? 'O' : null;
  const isCurrentTurn = game?.currentTurn === currentUser._id;

  return (
    <div className="bg-base-100 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="text-primary" size={24} />
          Tic-Tac-Toe
        </h3>
        {onClose && (
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <CloseIcon size={20} />
          </button>
        )}
      </div>

      {playerSymbol && (
        <div className="mb-4 text-center">
          <p className="text-sm text-base-content/70">
            You are: <span className={`font-bold ${playerSymbol === 'X' ? 'text-primary' : 'text-secondary'}`}>{playerSymbol}</span>
          </p>
          {!winner && !isDraw && (
            <p className={`text-sm mt-1 ${isCurrentTurn ? 'text-success font-semibold' : 'text-base-content/50'}`}>
              {isCurrentTurn ? "Your turn!" : "Opponent's turn..."}
            </p>
          )}
        </div>
      )}

      {winner && (
        <div className="alert alert-success mb-4">
          <Trophy size={20} />
          <span>Winner: {winner}!</span>
        </div>
      )}

      {isDraw && (
        <div className="alert alert-info mb-4">
          <span>It's a draw!</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderCell)}
      </div>

      {game?.players && (
        <div className="flex justify-between text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-6 h-6 rounded-full">
                <img src={game.players[0]?.profilePic || "/avatar.png"} alt="Player X" />
              </div>
            </div>
            <span className="text-primary font-semibold">X: {game.players[0]?.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-secondary font-semibold">O: {game.players[1]?.fullName}</span>
            <div className="avatar">
              <div className="w-6 h-6 rounded-full">
                <img src={game.players[1]?.profilePic || "/avatar.png"} alt="Player O" />
              </div>
            </div>
          </div>
        </div>
      )}

      {(winner || isDraw) && (
        <button
          onClick={handleReset}
          className="btn btn-outline w-full gap-2"
        >
          <RotateCcw size={18} />
          Play Again
        </button>
      )}
    </div>
  );
};

export default TicTacToeGame;
