"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoMysteryProps {
  onComplete: () => void;
  imageUrl: string;
  word: string;
  hints: string[];
}

export function PhotoMystery({
  onComplete,
  imageUrl,
  word,
  hints,
}: PhotoMysteryProps): React.JSX.Element {
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [incorrectGuesses, setIncorrectGuesses] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [pixelationLevel, setPixelationLevel] = useState<number>(20);
  const maxIncorrectGuesses = 6;

  const normalizedWord = word.toLowerCase();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (isGameOver) return;

      const letter = event.key.toLowerCase();
      if (!/^[a-z]$/.test(letter) || guessedLetters.has(letter)) return;

      const uniqueLetters = new Set(normalizedWord.replace(/\s/g, ""));
      const newGuessedLetters = new Set(guessedLetters).add(letter);
      setGuessedLetters(newGuessedLetters);

      if (!normalizedWord.includes(letter)) {
        const newIncorrectGuesses = incorrectGuesses + 1;
        setIncorrectGuesses(newIncorrectGuesses);
        if (newIncorrectGuesses >= maxIncorrectGuesses) {
          setIsGameOver(true);
        }
      } else {
        // Calculate progress and update pixelation
        const correctLetters = Array.from(newGuessedLetters).filter((l) =>
          normalizedWord.includes(l)
        );
        const progress = correctLetters.length / uniqueLetters.size;
        setPixelationLevel(Math.max(1, Math.floor(20 - progress * 19)));

        // Show hint
        if (correctLetters.length < hints.length) {
          setCurrentHint(correctLetters.length);
        }

        // Check win condition
        const isWon = Array.from(uniqueLetters).every((letter) =>
          newGuessedLetters.has(letter)
        );
        if (isWon) {
          setIsGameOver(true);
          setPixelationLevel(0);
          onComplete();
        }
      }
    },
    [
      guessedLetters,
      incorrectGuesses,
      isGameOver,
      normalizedWord,
      hints.length,
      onComplete,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const renderWord = () => {
    return word.split("").map((letter, index) => {
      const isSpace = letter === " ";
      const isGuessed = guessedLetters.has(letter.toLowerCase());
      return (
        <span
          key={index}
          className={cn(
            "mx-1 text-4xl font-bold inline-block w-8 text-center border-b-4",
            isSpace ? "border-transparent" : "border-indigo-300",
            isGuessed ? "text-indigo-600" : "text-transparent"
          )}
        >
          {isGuessed || isSpace ? letter : "_"}
        </span>
      );
    });
  };

  const renderHangman = () => {
    return (
      <div className="w-32 h-32 relative">
        {/* Base */}
        <div className="absolute bottom-0 w-full h-2 bg-indigo-800" />
        {/* Pole */}
        {incorrectGuesses > 0 && (
          <div className="absolute bottom-0 left-1/2 w-2 h-full bg-indigo-800" />
        )}
        {/* Top */}
        {incorrectGuesses > 1 && (
          <div className="absolute top-0 left-1/2 w-16 h-2 bg-indigo-800" />
        )}
        {/* Rope */}
        {incorrectGuesses > 2 && (
          <div className="absolute top-0 right-4 w-2 h-8 bg-indigo-800" />
        )}
        {/* Head */}
        {incorrectGuesses > 3 && (
          <div className="absolute top-8 right-2 w-6 h-6 rounded-full border-4 border-indigo-800" />
        )}
        {/* Body */}
        {incorrectGuesses > 4 && (
          <div className="absolute top-14 right-4 w-2 h-12 bg-indigo-800" />
        )}
        {/* Arms and Legs */}
        {incorrectGuesses > 5 && (
          <>
            <div className="absolute top-16 right-4 w-8 h-2 bg-indigo-800" />
            <div className="absolute top-16 right-4 w-8 h-2 bg-indigo-800 -scale-x-100" />
            <div className="absolute top-24 right-4 w-8 h-2 bg-indigo-800 rotate-45" />
            <div className="absolute top-24 right-4 w-8 h-2 bg-indigo-800 -rotate-45" />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-2xl mx-auto">
      <div className="relative w-full h-[500px] aspect-video rounded-lg overflow-hidden shadow-xl">
        <Image
          src={imageUrl}
          alt="Mystery Photo"
          fill
          className="object-cover"
          style={{
            filter: `blur(${pixelationLevel}px)`,
            transition: "filter 0.5s ease-out",
          }}
        />
      </div>

      <div className="flex justify-between w-full items-center px-4">
        <div className="flex-1">{renderHangman()}</div>
        <div className="flex-1 text-center">
          <p className="text-indigo-600 mb-2">
            {isGameOver
              ? incorrectGuesses >= maxIncorrectGuesses
                ? "Game Over! 😢"
                : "Congratulations! 🎉"
              : `Remaining tries: ${maxIncorrectGuesses - incorrectGuesses}`}
          </p>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="mb-8">{renderWord()}</div>
        {hints[currentHint] && !isGameOver && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-indigo-500 italic"
          >
            Hint: {hints[currentHint]}
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from("abcdefghijklmnopqrstuvwxyz").map((letter) => (
          <button
            key={letter}
            onClick={() => handleKeyPress({ key: letter } as KeyboardEvent)}
            disabled={guessedLetters.has(letter) || isGameOver}
            className={cn(
              "w-10 h-10 rounded-lg font-semibold transition-colors",
              guessedLetters.has(letter)
                ? normalizedWord.includes(letter)
                  ? "bg-green-200 text-green-700"
                  : "bg-red-200 text-red-700"
                : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
              "disabled:cursor-not-allowed"
            )}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
