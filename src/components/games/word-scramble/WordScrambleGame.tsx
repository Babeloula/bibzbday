"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrambleWord {
  word: string;
  hint: string;
  message: string;
}

interface WordScrambleGameProps {
  onComplete: () => void;
}

const WORDS: ScrambleWord[] = [
  {
    word: "TOUJOURS",
    hint: "Combien de temps je veux être avec toi",
    message: "Mon amour pour toi durera toujours ! 💖",
  },
  {
    word: "AMOUREUX",
    hint: "Ce que tu es pour moi",
    message: "Tu es mon âme sœur ! 💫",
  },
  {
    word: "MAGNIFIQUE",
    hint: "Ce que tu es, à l'intérieur comme à l'extérieur",
    message: "Ta beauté brille si fort ! ✨",
  },
  {
    word: "DESTIN",
    hint: "Ce qui nous a réunis",
    message: "Nous étions destinés à être ensemble ! 🌟",
  },
  {
    word: "PRECIEUX",
    hint: "Ce que tu représentes pour moi",
    message: "Tu es mon précieux trésor ! 💎",
  },
];

export default function WordScrambleGame({
  onComplete,
}: WordScrambleGameProps): React.JSX.Element {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Scramble the current word
  useEffect(() => {
    const word = WORDS[currentWordIndex].word;
    const letters = word.split("");
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
    setSelectedLetters([]);
    setShowMessage(false);
    setShowHint(false);
  }, [currentWordIndex]);

  const handleLetterClick = (
    letter: string,
    index: number,
    isScrambled: boolean
  ) => {
    if (isScrambled) {
      // Add letter from scrambled to selected
      setScrambledLetters((prev) => prev.filter((_, i) => i !== index));
      setSelectedLetters((prev) => [...prev, letter]);
    } else {
      // Return letter from selected to scrambled
      setSelectedLetters((prev) => prev.filter((_, i) => i !== index));
      setScrambledLetters((prev) => [...prev, letter]);
    }
  };

  // Check if word is correct
  useEffect(() => {
    const currentWord = WORDS[currentWordIndex].word;
    if (selectedLetters.join("") === currentWord) {
      setShowMessage(true);
      setTimeout(() => {
        if (currentWordIndex < WORDS.length - 1) {
          setCurrentWordIndex((prev) => prev + 1);
        } else {
          onComplete();
        }
      }, 2000);
    }
  }, [selectedLetters, currentWordIndex, onComplete]);

  const currentPuzzle = WORDS[currentWordIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Progress bar */}
      <div className="w-full h-2 bg-purple-100 rounded-full mb-8">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentWordIndex + 1) / WORDS.length) * 100}%` }}
        />
      </div>

      {/* Hint button */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowHint(true)}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
        >
          Besoin d&apos;un indice ? 💭
        </button>
      </div>

      {/* Hint text */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-8 text-purple-600 font-medium"
          >
            Indice : {currentPuzzle.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected letters */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: currentPuzzle.word.length }).map((_, index) => (
          <motion.div
            key={`selected-${index}`}
            className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 
              ${
                selectedLetters[index]
                  ? "border-purple-500 bg-white"
                  : "border-dashed border-purple-300"
              }`}
            initial={selectedLetters[index] ? { scale: 0.5 } : false}
            animate={selectedLetters[index] ? { scale: 1 } : false}
          >
            {selectedLetters[index] && (
              <motion.button
                className="text-2xl font-bold text-purple-700"
                onClick={() =>
                  handleLetterClick(selectedLetters[index], index, false)
                }
                whileHover={{ scale: 1.1 }}
              >
                {selectedLetters[index]}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Scrambled letters */}
      <div className="flex justify-center flex-wrap gap-2">
        {scrambledLetters.map((letter, index) => (
          <motion.button
            key={`scrambled-${index}`}
            className="w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-lg text-2xl font-bold shadow-md"
            whileHover={{ scale: 1.1 }}
            onClick={() => handleLetterClick(letter, index, true)}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Success message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-center mt-8 text-xl text-purple-700 font-medium"
          >
            {currentPuzzle.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
