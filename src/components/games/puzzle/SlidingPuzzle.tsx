"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface PuzzlePiece {
  id: number;
  currentPos: number;
  targetPos: number;
  content: string;
}

interface SlidingPuzzleProps {
  onComplete: () => void;
}

const GRID_SIZE = 3;
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;

// Heart-shaped pattern using emojis
const PUZZLE_CONTENT = [
  "💝",
  "💖",
  "💗",
  "💓",
  "💕",
  "💞",
  "💘",
  "💟",
  "", // Last piece is empty
];

export default function SlidingPuzzle({
  onComplete,
}: SlidingPuzzleProps): React.JSX.Element {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Initialize puzzle pieces
  useEffect(() => {
    if (isInitialized) return;

    const initialPieces: PuzzlePiece[] = Array.from(
      { length: TOTAL_PIECES },
      (_, index) => ({
        id: index,
        currentPos: index,
        targetPos: index,
        content: PUZZLE_CONTENT[index],
      })
    );

    // Shuffle pieces
    const shuffledPieces = [...initialPieces];
    for (let i = shuffledPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledPieces[i].currentPos;
      shuffledPieces[i].currentPos = shuffledPieces[j].currentPos;
      shuffledPieces[j].currentPos = temp;
    }

    setPieces(shuffledPieces);
    setIsInitialized(true);
  }, [isInitialized]);

  // Check if puzzle is solved
  useEffect(() => {
    if (!pieces.length) return;

    const isSolved = pieces.every(
      (piece) => piece.currentPos === piece.targetPos
    );
    if (isSolved) {
      setTimeout(() => onComplete(), 500);
    }
  }, [pieces, onComplete]);

  const canMove = (currentPos: number, emptyPos: number): boolean => {
    const currentRow = Math.floor(currentPos / GRID_SIZE);
    const currentCol = currentPos % GRID_SIZE;
    const emptyRow = Math.floor(emptyPos / GRID_SIZE);
    const emptyCol = emptyPos % GRID_SIZE;

    return (
      (Math.abs(currentRow - emptyRow) === 1 && currentCol === emptyCol) ||
      (Math.abs(currentCol - emptyCol) === 1 && currentRow === emptyRow)
    );
  };

  const movePiece = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      setPieces((currentPieces) => {
        const emptyPiece = currentPieces.find((p) => p.content === "");
        if (!emptyPiece) return currentPieces;

        const emptyPos = emptyPiece.currentPos;
        let targetPos: number;

        switch (direction) {
          case "up":
            targetPos = emptyPos - GRID_SIZE;
            if (targetPos < 0) return currentPieces;
            break;
          case "down":
            targetPos = emptyPos + GRID_SIZE;
            if (targetPos >= TOTAL_PIECES) return currentPieces;
            break;
          case "left":
            targetPos = emptyPos - 1;
            if (
              Math.floor(targetPos / GRID_SIZE) !==
              Math.floor(emptyPos / GRID_SIZE)
            )
              return currentPieces;
            break;
          case "right":
            targetPos = emptyPos + 1;
            if (
              Math.floor(targetPos / GRID_SIZE) !==
              Math.floor(emptyPos / GRID_SIZE)
            )
              return currentPieces;
            break;
          default:
            return currentPieces;
        }

        const targetPiece = currentPieces.find(
          (p) => p.currentPos === targetPos
        );
        if (!targetPiece) return currentPieces;

        const newPieces = currentPieces.map((piece) => {
          if (piece.id === targetPiece.id) {
            return { ...piece, currentPos: emptyPos };
          }
          if (piece.id === emptyPiece.id) {
            return { ...piece, currentPos: targetPos };
          }
          return piece;
        });

        setMoves((prev) => prev + 1);
        return newPieces;
      });
    },
    []
  );

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          movePiece("up");
          break;
        case "ArrowDown":
          movePiece("down");
          break;
        case "ArrowLeft":
          movePiece("left");
          break;
        case "ArrowRight":
          movePiece("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePiece]);

  const handlePieceClick = (clickedPiece: PuzzlePiece) => {
    const emptyPiece = pieces.find((p) => p.content === "");
    if (!emptyPiece) return;

    const emptyPos = emptyPiece.currentPos;
    const clickedPos = clickedPiece.currentPos;

    // Determine direction based on positions
    if (canMove(clickedPos, emptyPos)) {
      if (clickedPos === emptyPos - GRID_SIZE) movePiece("up");
      else if (clickedPos === emptyPos + GRID_SIZE) movePiece("down");
      else if (clickedPos === emptyPos - 1) movePiece("left");
      else if (clickedPos === emptyPos + 1) movePiece("right");
    }
  };

  const getPosition = (pos: number) => ({
    x: (pos % GRID_SIZE) * 100,
    y: Math.floor(pos / GRID_SIZE) * 100,
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-[300px] h-[300px] bg-indigo-100 rounded-xl overflow-hidden shadow-xl">
        {pieces.map(
          (piece) =>
            piece.content && (
              <motion.button
                key={piece.id}
                className={`absolute w-[100px] h-[100px] flex items-center justify-center 
              text-4xl bg-white border-2 border-indigo-200 cursor-pointer
              hover:bg-indigo-50 transition-colors
              ${
                showHint && piece.currentPos !== piece.targetPos
                  ? "border-red-300"
                  : ""
              }`}
                animate={getPosition(piece.currentPos)}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => handlePieceClick(piece)}
              >
                {piece.content}
              </motion.button>
            )
        )}

        <div className="absolute bottom-[-40px] left-0 right-0 text-center text-indigo-600">
          Mouvements : {moves}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowHint(!showHint)}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
        >
          {showHint ? "Cacher l&apos;indice" : "Montrer l&apos;indice"} 💡
        </button>
        <div className="text-indigo-600 text-sm">
          Utilise les flèches du clavier ou clique sur les tuiles pour les
          déplacer
        </div>
      </div>
    </div>
  );
}
