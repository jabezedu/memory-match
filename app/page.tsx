"use client";

import { useState, useEffect, useRef, useTransition } from "react";

const EMOJIS = ["🚀", "⚡", "🌟", "🎨", "🍕", "🎮", "💎", "🔥"];

interface Card {
  id: number;
  emoji: string;
}

function shuffleCards(): Card[] {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, index) => ({
    id: index,
    emoji,
  }));
  return deck.sort(() => Math.random() - 0.5);
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = useTransition();

  const isWon = cards.length > 0 && matched.length === cards.length;

  const initGame = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setGameStarted(false);
    setIsLocked(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startTransition(() => {
      initGame();
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !isWon) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (isWon && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, isWon]);

  const handleCardClick = (id: number) => {
    if (isLocked || flipped.includes(id) || matched.includes(id)) return;

    if (!gameStarted) setGameStarted(true);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setMatched((prev) => [...prev, firstId, secondId]);
        setFlipped([]);
      } else {
        setIsLocked(true);
        setTimeout(() => {
          setFlipped([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <main className="min-h-screen bg-amber-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-amber-100/60 dark:shadow-none border border-amber-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <h1 className="text-xl font-bold tracking-tight">Memory Match</h1>
          </div>
          <button
            onClick={initGame}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            Restart
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 dark:bg-zinc-800/50 rounded-2xl border border-amber-100/80 dark:border-zinc-800 text-center">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Moves</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{moves}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Time</p>
            <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatTime(seconds)}
            </p>
          </div>
        </div>

        {/* 4x4 Grid */}
        <div className="grid grid-cols-4 gap-3 aspect-square">
          {cards.map((card) => {
            const isCardFlipped = flipped.includes(card.id) || matched.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="relative cursor-pointer select-none [perspective:1000px]"
              >
                <div
                  className={`w-full h-full duration-500 rounded-2xl transition-all [transform-style:preserve-3d] ${
                    isCardFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* Card Front (hidden symbol) */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-amber-100/60 dark:bg-zinc-800/80 border-2 border-amber-200/80 dark:border-zinc-700 [backface-visibility:hidden] hover:border-amber-400 transition">
                    <span className="text-amber-500/50 text-xl font-bold">?</span>
                  </div>

                  {/* Card Back (revealed symbol) */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-2xl border-2 text-2xl sm:text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-sm ${
                      matched.includes(card.id)
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white dark:bg-zinc-800 border-amber-400"
                    }`}
                  >
                    {card.emoji}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win Screen Modal */}
        {isWon && (
          <div className="p-5 rounded-2xl bg-amber-500 text-white text-center space-y-3 shadow-lg shadow-amber-200 dark:shadow-none animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black">🎉 You Won!</h2>
            <p className="text-sm text-amber-100">
              Cleared in <span className="font-bold text-white">{moves} moves</span> and{" "}
              <span className="font-bold text-white">{formatTime(seconds)}</span>.
            </p>
            <button
              onClick={initGame}
              className="w-full py-2.5 rounded-xl font-bold bg-white text-amber-700 hover:bg-amber-50 transition active:scale-95 shadow"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
