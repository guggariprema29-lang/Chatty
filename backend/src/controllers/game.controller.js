import Game from "../models/game.model.js";
import { io } from "../lib/socket.js";

export const createGame = async (req, res) => {
  try {
    const { chatId, chatType, gameType, players } = req.body;
    const createdBy = req.user._id;

    if (!chatId || !chatType || !gameType) {
      return res.status(400).json({
        message: "chatId, chatType, and gameType are required",
      });
    }

    if (!["tictactoe", "quiz", "typing"].includes(gameType)) {
      return res.status(400).json({
        message: "Invalid game type",
      });
    }

    let initialGameState = {};
    if (gameType === "tictactoe") {
      initialGameState = {
        board: Array(9).fill(null),
        currentPlayer: 0,
      };
    } else if (gameType === "quiz") {
      // Allow creating a quiz with provided questions (from frontend) or fall back to a small default set
      const providedQuestions = req.body.questions;
      initialGameState = {
        questions: Array.isArray(providedQuestions) && providedQuestions.length > 0
          ? providedQuestions
          : [
              {
                id: 0,
                text: "What is the capital of France?",
                options: ["Paris", "London", "Rome", "Berlin"],
                correctOption: 0,
              },
              {
                id: 1,
                text: "Which planet is known as the Red Planet?",
                options: ["Earth", "Mars", "Jupiter", "Venus"],
                correctOption: 1,
              },
            ],
        currentQuestion: 0,
        scores: {},
      };
    } else if (gameType === "typing") {
      initialGameState = {
        text: "",
        scores: {},
      };
    }

    const game = new Game({
      gameType,
      players: players || [createdBy],
      chatId,
      chatType,
      gameState: initialGameState,
      createdBy,
    });

    await game.save();
    await game.populate("players", "fullName profilePic");
    await game.populate("createdBy", "fullName profilePic");

    try {
      if (chatType === "group") {
        io.to(`group:${chatId}`).emit("newGame", game);
      } else {
        io.to(chatId).emit("newGame", game);
      }
    } catch (err) {
      console.error("Failed to emit new game:", err);
    }

    res.status(201).json(game);
  } catch (error) {
    console.error("Error in createGame:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const makeMove = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { move } = req.body;
    const userId = req.user._id;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (!game.isActive) {
      return res.status(400).json({ message: "Game is not active" });
    }

    const playerIndex = game.players.findIndex(
      (p) => String(p) === String(userId)
    );

    if (playerIndex === -1) {
      return res.status(403).json({ message: "You are not a player in this game" });
    }

    if (game.gameType === "tictactoe") {
      const { position } = move;
      if (
        position < 0 ||
        position > 8 ||
        game.gameState.board[position] !== null
      ) {
        return res.status(400).json({ message: "Invalid move" });
      }

      if (game.gameState.currentPlayer !== playerIndex) {
        return res.status(400).json({ message: "Not your turn" });
      }

      game.gameState.board[position] = playerIndex;
      game.gameState.currentPlayer = (playerIndex + 1) % game.players.length;

      const winner = checkTicTacToeWinner(game.gameState.board);
      if (winner !== null) {
        game.winner = game.players[winner];
        game.isActive = false;
      } else if (game.gameState.board.every((cell) => cell !== null)) {
        game.isActive = false;
      }
    }

    // Quiz answer handling
    if (game.gameType === "quiz" && move && move.type === "quiz_answer") {
      const { questionIndex, selectedOption, correct } = move;
      const qs = game.gameState.questions || [];

      // If server has no questions saved, accept client-provided result (frontend computes `correct`)
      if (qs.length === 0) {
        // treat questionIndex as 0 in this fallback
        const qi = questionIndex == null ? 0 : questionIndex;

        // init structures
        game.gameState.scores = game.gameState.scores || {};
        game.gameState.answered = game.gameState.answered || {};
        game.gameState.answered[qi] = game.gameState.answered[qi] || [];

        if (game.gameState.answered[qi].includes(String(userId))) {
          return res.status(400).json({ message: "You have already answered this question" });
        }

        game.gameState.answered[qi].push(String(userId));
        const uid = String(userId);
        const isCorrect = typeof correct === "boolean" ? correct : false;
        game.gameState.scores[uid] = (game.gameState.scores[uid] || 0) + (isCorrect ? 1 : 0);

        // advance question index if all players answered
        const answeredCount = game.gameState.answered[qi].length;
        if (answeredCount >= game.players.length) {
          game.gameState.currentQuestion = (game.gameState.currentQuestion || 0) + 1;
        }

        // if we've exhausted questions (none on server), finish when currentQuestion >= 1
        if ((game.gameState.currentQuestion || 0) >= qs.length && qs.length === 0) {
          game.isActive = false;
          // determine winner (highest score)
          const scores = game.gameState.scores || {};
          let best = -Infinity;
          let bestPlayer = null;
          for (const p of game.players) {
            const pid = String(p);
            const s = scores[pid] || 0;
            if (s > best) {
              best = s;
              bestPlayer = pid;
            }
          }
          if (bestPlayer) game.winner = bestPlayer;
        }
      } else {
        if (questionIndex == null || questionIndex < 0 || questionIndex >= qs.length) {
          return res.status(400).json({ message: "Invalid question index" });
        }

        const question = qs[questionIndex];
        const isCorrect = question && question.correctOption === selectedOption;

        // init structures
        game.gameState.scores = game.gameState.scores || {};
        game.gameState.answered = game.gameState.answered || {};
        game.gameState.answered[questionIndex] = game.gameState.answered[questionIndex] || [];

        // avoid double-answering
        if (game.gameState.answered[questionIndex].includes(String(userId))) {
          return res.status(400).json({ message: "You have already answered this question" });
        }

        game.gameState.answered[questionIndex].push(String(userId));
        const uid = String(userId);
        game.gameState.scores[uid] = (game.gameState.scores[uid] || 0) + (isCorrect ? 1 : 0);

        // if all players answered this question, advance
        const answeredCount = game.gameState.answered[questionIndex].length;
        if (answeredCount >= game.players.length) {
          game.gameState.currentQuestion = (game.gameState.currentQuestion || 0) + 1;
        }

        // if we've exhausted questions, finish and determine winner
        if ((game.gameState.currentQuestion || 0) >= qs.length) {
          game.isActive = false;
          // determine winner (highest score)
          const scores = game.gameState.scores || {};
          let best = -Infinity;
          let bestPlayer = null;
          for (const p of game.players) {
            const pid = String(p);
            const s = scores[pid] || 0;
            if (s > best) {
              best = s;
              bestPlayer = pid;
            }
          }
          if (bestPlayer) game.winner = bestPlayer;
        }
      }
    }

    // Typing result handling
    if (game.gameType === "typing" && move && move.type === "typing_result") {
      const { wpm } = move;
      if (typeof wpm !== "number") {
        return res.status(400).json({ message: "Invalid typing result" });
      }

      game.gameState.scores = game.gameState.scores || {};
      game.gameState.scores[String(userId)] = wpm;

      // if all players have reported, determine winner
      const reported = Object.keys(game.gameState.scores || {}).length;
      if (reported >= game.players.length) {
        // find highest wpm
        let best = -Infinity;
        let bestPlayer = null;
        for (const [pid, score] of Object.entries(game.gameState.scores)) {
          if (score > best) {
            best = score;
            bestPlayer = pid;
          }
        }
        if (bestPlayer) {
          game.winner = bestPlayer;
          game.isActive = false;
        }
      }
    }

    game.markModified("gameState");
    await game.save();

    await game.populate("players", "fullName profilePic");
    await game.populate("createdBy", "fullName profilePic");
    if (game.winner) {
      await game.populate("winner", "fullName profilePic");
    }

    try {
      if (game.chatType === "group") {
        io.to(`group:${game.chatId}`).emit("gameUpdate", game);
      } else {
        io.to(game.chatId).emit("gameUpdate", game);
      }
    } catch (err) {
      console.error("Failed to emit game update:", err);
    }

    res.status(200).json(game);
  } catch (error) {
    console.error("Error in makeMove:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveGames = async (req, res) => {
  try {
    const { chatId } = req.params;

    const games = await Game.find({ chatId, isActive: true })
      .populate("players", "fullName profilePic")
      .populate("createdBy", "fullName profilePic")
      .populate("winner", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(games);
  } catch (error) {
    console.error("Error in getActiveGames:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const endGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { winnerId } = req.body;
    const userId = req.user._id;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (String(game.createdBy) !== String(userId)) {
      return res.status(403).json({
        message: "Only the game creator can end the game",
      });
    }

    game.isActive = false;
    if (winnerId) {
      game.winner = winnerId;
    }

    await game.save();
    await game.populate("players", "fullName profilePic");
    await game.populate("createdBy", "fullName profilePic");
    if (game.winner) {
      await game.populate("winner", "fullName profilePic");
    }

    try {
      if (game.chatType === "group") {
        io.to(`group:${game.chatId}`).emit("gameEnded", game);
      } else {
        io.to(game.chatId).emit("gameEnded", game);
      }
    } catch (err) {
      console.error("Failed to emit game end:", err);
    }

    res.status(200).json(game);
  } catch (error) {
    console.error("Error in endGame:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

function checkTicTacToeWinner(board) {
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

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}
