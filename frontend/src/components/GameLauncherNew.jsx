import { useEffect, useState } from "react";
import { X, Gamepad2, Brain, Keyboard, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import TicTacToeGame from "./TicTacToeGame";
import QuizBattle from "./QuizBattle";
import TypingSpeed from "./TypingSpeed";
import { useChatStore } from "../store/useChatStore";

const GameLauncher = ({ isOpen, onClose, onStartGame, chatId, chatType }) => {
  const [activeGames, setActiveGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { authUser } = useAuthStore();
  const socket = useAuthStore.getState().socket;
  const { selectedGroup, selectedUser } = useChatStore();
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);

  const gameTypes = [
    {
      id: "tictactoe",
      name: "Tic-Tac-Toe",
      icon: Gamepad2,
      description: "Classic 3x3 grid game",
      color: "text-primary",
    },
    {
      id: "quiz",
      name: "Quiz Battle",
      icon: Brain,
      description: "Test your knowledge",
      color: "text-secondary",
    },
    {
      id: "typing",
      name: "Typing Speed",
      icon: Keyboard,
      description: "Race to type faster",
      color: "text-accent",
    },
  ];

  const handleStartGame = async (gameType) => {
    setIsLoading(true);
    try {
      // determine players based on chat context and selected opponent
      let playersToSend = [authUser?._id];
      if (chatType === "user" && selectedUser) {
        playersToSend = [authUser?._id, selectedUser._id];
      } else if (chatType === "group") {
        // if a specific opponent was chosen, include them
        if (selectedOpponent) playersToSend = [authUser?._id, selectedOpponent];
      }

      await onStartGame(gameType, playersToSend);
      toast.success(`${gameType.name} started!`);
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to start game");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getGameStatus = (game) => {
    if (game.status === "completed") return "Finished";
    if (game.status === "in-progress") return "Playing";
    return "Waiting";
  };

  const normalizeGame = (game) => {
    const boardIdx = game.gameState?.board ?? game.board ?? null;
    const board = boardIdx
      ? boardIdx.map((v) => (v === null || v === undefined ? null : v === 0 ? "X" : "O"))
      : null;

    const currentPlayerIdx = game.gameState?.currentPlayer;
    const currentTurn =
      currentPlayerIdx !== null && currentPlayerIdx !== undefined && game.players
        ? game.players[currentPlayerIdx]?._id
        : null;

    let winnerSymbol = null;
    if (game.winner) {
      // winner may be an id or an object; compare to players
      const winnerId = typeof game.winner === "object" ? game.winner._id : game.winner;
      if (game.players && game.players[0] && String(game.players[0]._id) === String(winnerId)) winnerSymbol = "X";
      else if (game.players && game.players[1] && String(game.players[1]._id) === String(winnerId)) winnerSymbol = "O";
    }

    return {
      ...game,
      type: game.gameType || game.type,
      board,
      currentTurn,
      isDraw: game.gameState?.isDraw ?? game.isDraw ?? false,
      status: game.isActive ? (game.gameState ? "in-progress" : "waiting") : "completed",
      winner: winnerSymbol,
    };
  };

  const handleOpenGame = (game) => {
    setSelectedGame(game);
  };

  const handleMove = async (gameId, moveData) => {
    try {
      const res = await axiosInstance.post(`/games/${gameId}/move`, { move: moveData });
      const updated = res.data;
      const ng = normalizeGame(updated);
      setActiveGames((prev) => prev.map((g) => (g._id === ng._id ? ng : g)));
      setSelectedGame(ng);
    } catch (err) {
      toast.error("Invalid move");
      throw err;
    }
  };

  useEffect(() => {
    if (!isOpen || !chatId) return;

    let mounted = true;

    const load = async () => {
      try {
        const res = await axiosInstance.get(`/games/chat/${chatId}/active`);
        if (!mounted) return;
        setActiveGames(res.data.map(normalizeGame));
      } catch (err) {
        console.error("Failed to load active games:", err);
      }
    };

    load();

    if (socket) {
      socket.on("newGame", (game) => {
        setActiveGames((prev) => [normalizeGame(game), ...prev]);
        toast.success("New game started! 🎮");
      });

      socket.on("gameUpdate", (updatedGame) => {
        setActiveGames((prev) => prev.map((g) => (g._id === updatedGame._id ? normalizeGame(updatedGame) : g)));
      });

      socket.on("gameEnded", (ended) => {
        const id = ended?._id || ended;
        setActiveGames((prev) => prev.filter((g) => g._id !== id));
      });
    }

    return () => {
      mounted = false;
      if (socket) {
        socket.off("newGame");
        socket.off("gameUpdate");
        socket.off("gameEnded");
      }
    };
  }, [isOpen, chatId, socket]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="text-primary" size={24} />
            <h3 className="text-xl font-semibold">Game Center</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-base-content/70">Start New Game</h4>
          {/* Opponent selector */}
          {(chatType === "group" || chatType === "user") && (
            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs">Opponent</label>
              {chatType === "user" && selectedUser ? (
                <div className="text-sm ml-2">{selectedUser.fullName || selectedUser.username}</div>
              ) : null}

              {chatType === "group" && selectedGroup && (
                <select
                  value={selectedOpponent || ""}
                  onChange={(e) => setSelectedOpponent(e.target.value)}
                  className="select select-sm ml-2"
                >
                  <option value="">Choose opponent</option>
                  {selectedGroup.members?.map((m) => {
                    const u = m.user || m;
                    if (!u) return null;
                    if (String(u._id) === String(authUser?._id)) return null;
                    return (
                      <option key={u._id} value={u._id}>
                        {u.fullName || u.username}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {gameTypes.map((game) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => handleStartGame(game)}
                  disabled={isLoading}
                  className="btn btn-outline h-auto flex-col p-4 gap-2 hover:scale-105 transition-transform"
                >
                  <Icon className={game.color} size={32} />
                  <div className="text-center">
                    <p className="font-semibold">{game.name}</p>
                    <p className="text-xs text-base-content/60">{game.description}</p>
                  </div>
                  {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {activeGames.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-base-content/70">Active Games</h4>
            <div className="space-y-2">
              {activeGames.map((game) => {
                const gameType = gameTypes.find((g) => g.id === game.type);
                const Icon = gameType?.icon || Gamepad2;
                const isMyTurn = game.currentTurn === authUser?._id;

                return (
                  <div
                    key={game._id}
                    onClick={() => handleOpenGame(game)}
                    role="button"
                    tabIndex={0}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${isMyTurn ? "border-primary bg-primary/5" : "border-base-300 bg-base-200"}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={gameType?.color || "text-base-content"} size={24} />
                        <div>
                          <p className="font-semibold">{gameType?.name || game.type}</p>
                          <p className="text-xs text-base-content/60">
                            vs {game.players?.find((p) => p._id !== authUser?._id)?.fullName || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`badge badge-sm ${
                          game.status === "completed" ? "badge-success" : game.status === "in-progress" ? "badge-primary" : "badge-warning"
                        }`}>
                          {getGameStatus(game)}
                        </span>
                        {isMyTurn && game.status === "in-progress" && (
                          <p className="text-xs text-success mt-1 font-semibold">Your turn!</p>
                        )}
                      </div>
                    </div>

                    {game.winner && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Trophy size={16} className="text-warning" />
                        <span>
                          Winner: {game.winner === authUser?._id ? "You!" : game.winner.fullName}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inline game modal when user clicks an active game */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center">
            <div className="bg-base-100 rounded-lg p-4 max-w-md w-full">
              <div className="flex justify-end">
                <button onClick={() => setSelectedGame(null)} className="btn btn-ghost btn-sm btn-circle">
                  <X size={16} />
                </button>
              </div>
              {(selectedGame.gameType === "tictactoe" || selectedGame.type === "tictactoe") && (
                <TicTacToeGame
                  game={selectedGame}
                  onMove={(moveData) => handleMove(selectedGame._id, moveData)}
                  currentUser={authUser}
                  onClose={() => setSelectedGame(null)}
                />
              )}
              {(selectedGame.gameType === "quiz" || selectedGame.type === "quiz") && (
                <QuizBattle
                  game={selectedGame}
                  onMove={(moveData) => handleMove(selectedGame._id, moveData)}
                  currentUser={authUser}
                  onClose={() => setSelectedGame(null)}
                />
              )}

              {(selectedGame.gameType === "typing" || selectedGame.type === "typing") && (
                <TypingSpeed
                  game={selectedGame}
                  onMove={(moveData) => handleMove(selectedGame._id, moveData)}
                  currentUser={authUser}
                  onClose={() => setSelectedGame(null)}
                />
              )}
            </div>
          </div>
        )}

        {activeGames.length === 0 && (
          <div className="text-center py-8 text-base-content/50">
            <Gamepad2 size={48} className="mx-auto mb-2 opacity-50" />
            <p>No active games. Start one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLauncher;
