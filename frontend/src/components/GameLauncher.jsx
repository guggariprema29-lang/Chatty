import { useState } from "react";
import { X, Gamepad2, Brain, Keyboard, Trophy } from "lucide-react";
import toast from "react-hot-toast";

const GameLauncher = ({ isOpen, onClose, onStartGame, activeGames = [], currentUser }) => {
  const [isLoading, setIsLoading] = useState(false);

  const gameTypes = [
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      icon: Gamepad2,
      description: 'Classic 3x3 grid game',
      color: 'text-primary'
    },
    {
      id: 'quiz',
      name: 'Quiz Battle',
      icon: Brain,
      description: 'Test your knowledge',
      color: 'text-secondary'
    },
    {
      id: 'typing',
      name: 'Typing Speed',
      icon: Keyboard,
      description: 'Race to type faster',
      color: 'text-accent'
    }
  ];

  const handleStartGame = async (gameType) => {
    setIsLoading(true);
    try {
      await onStartGame(gameType);
      toast.success(`${gameType.name} started!`);
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  };

  const getGameStatus = (game) => {
    if (game.status === 'completed') return 'Finished';
    if (game.status === 'in-progress') return 'Playing';
    return 'Waiting';
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {gameTypes.map((game) => {
              const Icon = game.icon;
          import { useEffect } from "react";
          import { axiosInstance } from "../lib/axios";
          import { useAuthStore } from "../store/useAuthStore";
              return (
                <button
          const GameLauncher = ({ isOpen, onClose, onStartGame, chatId, chatType }) => {
            const [activeGames, setActiveGames] = useState([]);
            const [isLoading, setIsLoading] = useState(false);
            const { authUser } = useAuthStore();
            const socket = useAuthStore.getState().socket;
                  disabled={isLoading}
                  className="btn btn-outline h-auto flex-col p-4 gap-2 hover:scale-105 transition-transform"
                >
                  <Icon className={game.color} size={32} />
                await onStartGame(gameType);
                    <p className="font-semibold">{game.name}</p>
                    <p className="text-xs text-base-content/60">{game.description}</p>
                  </div>
                  {isLoading && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeGames.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-base-content/70">Active Games</h4>
            const normalizeGame = (game) => {
              return {
                ...game,
                type: game.gameType || game.type,
                currentTurn: game.gameState?.currentPlayer ?? null,
                status: game.isActive ? (game.gameState ? 'in-progress' : 'waiting') : 'completed',
              };
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
                  setActiveGames((prev) => prev.map(g => g._id === updatedGame._id ? normalizeGame(updatedGame) : g));
                });

                socket.on("gameEnded", (ended) => {
                  // backend may emit full game or id
                  const id = ended?._id || ended;
                  setActiveGames((prev) => prev.filter(g => g._id !== id));
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
            <div className="space-y-2">
              {activeGames.map((game) => {
                const gameType = gameTypes.find(g => g.id === game.type);
                const Icon = gameType?.icon || Gamepad2;
                const isMyTurn = game.currentTurn === currentUser?._id;
                
                return (
                  <div
                    key={game._id}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isMyTurn ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-200'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={gameType?.color || 'text-base-content'} size={24} />
                        <div>
                          <p className="font-semibold">{gameType?.name || game.type}</p>
                          <p className="text-xs text-base-content/60">
                            vs {game.players?.find(p => p._id !== currentUser?._id)?.fullName || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`
                          badge badge-sm
                          ${game.status === 'completed' ? 'badge-success' : 
                            game.status === 'in-progress' ? 'badge-primary' : 'badge-warning'}
                        `}>
                          {getGameStatus(game)}
                        </span>
                        {isMyTurn && game.status === 'in-progress' && (
                          <p className="text-xs text-success mt-1 font-semibold">Your turn!</p>
                        )}
                      </div>
                    </div>

                    {game.winner && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Trophy size={16} className="text-warning" />
                        <span>
                          Winner: {game.winner === currentUser?._id ? 'You!' : game.winner.fullName}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
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
