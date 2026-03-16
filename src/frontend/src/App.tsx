import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { RotateCcw, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  useGetScores,
  useRecordGameResult,
  useResetScores,
} from "./hooks/useQueries";

type Cell = "X" | "O" | null;
type Winner = "X" | "O" | "Draw" | null;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const CELL_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

function checkWinner(board: Cell[]): { winner: Winner; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Winner, line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: "Draw", line: null };
  }
  return { winner: null, line: null };
}

export default function App() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [resultRecorded, setResultRecorded] = useState(false);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [finalResult, setFinalResult] = useState<Winner>(null);

  const { data: scores, isLoading: scoresLoading } = useGetScores();
  const recordGame = useRecordGameResult();
  const resetScores = useResetScores();

  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] || gameOver) return;

      const newBoard = [...board];
      newBoard[index] = isXTurn ? "X" : "O";
      setBoard(newBoard);

      const { winner, line } = checkWinner(newBoard);
      if (winner) {
        setGameOver(true);
        setWinLine(line);
        setFinalResult(winner);
        if (!resultRecorded) {
          setResultRecorded(true);
          recordGame.mutate(winner, {
            onError: () => toast.error("Failed to save score"),
          });
        }
      } else {
        setIsXTurn(!isXTurn);
      }
    },
    [board, gameOver, isXTurn, resultRecorded, recordGame],
  );

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setGameOver(false);
    setResultRecorded(false);
    setWinLine(null);
    setFinalResult(null);
  };

  const handleResetScores = () => {
    resetScores.mutate(undefined, {
      onSuccess: () => toast.success("Scores reset!"),
      onError: () => toast.error("Failed to reset scores"),
    });
  };

  const currentPlayer = isXTurn ? "X" : "O";

  // Play Again button style mirrors the current winner's color
  const playAgainStyle =
    finalResult === "O"
      ? {
          background: "oklch(0.62 0.22 25)",
          color: "oklch(0.98 0.01 100)",
          boxShadow: "0 0 30px oklch(0.62 0.22 25 / 0.45)",
        }
      : {
          background: "oklch(0.62 0.2 250)",
          color: "oklch(0.98 0.01 100)",
          boxShadow: "0 0 30px oklch(0.62 0.2 250 / 0.45)",
        };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />

      <header className="pt-10 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <Zap className="w-7 h-7 x-text" />
            <h1 className="font-display text-5xl font-800 tracking-tight text-foreground">
              TIC TAC TOE
            </h1>
            <Zap className="w-7 h-7 o-text" />
          </div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-body">
            Classic strategy game
          </p>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16 gap-10">
        {/* Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">
                  Scoreboard
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                data-ocid="scores.delete_button"
                onClick={handleResetScores}
                disabled={resetScores.isPending}
                className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>

            {scoresLoading ? (
              <div data-ocid="game.loading_state" className="flex gap-4">
                <Skeleton className="h-16 flex-1 rounded-lg" />
                <Skeleton className="h-16 flex-1 rounded-lg" />
                <Skeleton className="h-16 flex-1 rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <ScoreCard
                  label="X Wins"
                  value={Number(scores?.xWins ?? 0)}
                  color="x"
                />
                <ScoreCard
                  label="Draws"
                  value={Number(scores?.draws ?? 0)}
                  color="muted"
                />
                <ScoreCard
                  label="O Wins"
                  value={Number(scores?.oWins ?? 0)}
                  color="o"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Turn indicator / result */}
        <AnimatePresence mode="wait">
          {gameOver ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <p className="font-display text-3xl font-800 tracking-tight">
                {finalResult === "Draw" ? (
                  <span className="text-muted-foreground">
                    It&apos;s a Draw!
                  </span>
                ) : (
                  <span
                    className={
                      finalResult === "X" ? "x-text x-glow" : "o-text o-glow"
                    }
                  >
                    Player {finalResult} Wins!
                  </span>
                )}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="turn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-muted-foreground text-sm font-body">
                Current turn
              </span>
              <span
                className={`font-display text-2xl font-700 ${
                  currentPlayer === "X" ? "x-text x-glow" : "o-text o-glow"
                }`}
              >
                {currentPlayer}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          data-ocid="game.canvas_target"
          className="grid grid-cols-3 gap-3 p-5 bg-card border border-border rounded-2xl"
          style={{
            boxShadow:
              "0 0 60px oklch(0.62 0.2 250 / 0.06), 0 20px 40px oklch(0 0 0 / 0.4)",
          }}
        >
          {CELL_POSITIONS.map((pos) => (
            <GameCell
              key={pos}
              index={pos}
              value={board[pos]}
              isWinCell={winLine?.includes(pos) ?? false}
              winPlayer={
                finalResult === "X" || finalResult === "O" ? finalResult : null
              }
              gameOver={gameOver}
              onClick={() => handleCellClick(pos)}
            />
          ))}
        </motion.div>

        {/* Play Again */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Button
                data-ocid="game.button"
                onClick={handlePlayAgain}
                className="font-display text-lg px-10 py-6 rounded-xl font-700 tracking-wide"
                style={playAgainStyle}
              >
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-6 text-muted-foreground text-xs">
        &copy; {new Date().getFullYear()}. Built with &hearts; using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  color,
}: { label: string; value: number; color: "x" | "o" | "muted" }) {
  const colorClass =
    color === "x"
      ? "x-text"
      : color === "o"
        ? "o-text"
        : "text-muted-foreground";
  return (
    <div className="bg-secondary rounded-lg p-3 text-center">
      <p className={`font-display text-3xl font-700 ${colorClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1 font-body">{label}</p>
    </div>
  );
}

function GameCell({
  index,
  value,
  isWinCell,
  winPlayer,
  gameOver,
  onClick,
}: {
  index: number;
  value: Cell;
  isWinCell: boolean;
  winPlayer: "X" | "O" | null;
  gameOver: boolean;
  onClick: () => void;
}) {
  const markerIndex = index + 1;
  const canClick = !value && !gameOver;

  const winClass = isWinCell
    ? winPlayer === "X"
      ? "cell-win-x border-transparent"
      : "cell-win-o border-transparent"
    : "border-border bg-secondary hover:bg-muted";

  return (
    <motion.button
      data-ocid={`game.cell.${markerIndex}`}
      onClick={onClick}
      whileHover={canClick ? { scale: 1.05 } : {}}
      whileTap={canClick ? { scale: 0.95 } : {}}
      className={[
        "w-24 h-24 rounded-xl border flex items-center justify-center transition-colors duration-200",
        winClass,
        canClick ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <AnimatePresence>
        {value && (
          <motion.span
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`font-display text-4xl font-800 select-none ${
              value === "X" ? "x-text x-glow" : "o-text o-glow"
            }`}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
