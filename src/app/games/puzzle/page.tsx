"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PhotoMystery } from "@/components/games/photo-mystery/PhotoMystery";

interface GameStage {
  imageUrl: string;
  word: string;
  hints: string[];
}

const gameStages: GameStage[] = [
  {
    imageUrl: "/assets/games/hangman/hangman1.jpg",
    word: "AMOUR",
    hints: [
      "Un sentiment profond...",
      "Quelque chose qui nous unit...",
      "Le plus beau des cadeaux...",
      "Ce que je ressens pour toi...",
      "💖",
    ],
  },
  {
    imageUrl: "/assets/games/hangman/hangman2.jpg",
    word: "BONHEUR",
    hints: [
      "Ce que tu m'apportes chaque jour...",
      "Un état d'esprit positif...",
      "La joie de vivre ensemble...",
      "Notre quotidien...",
      "😊",
    ],
  },
  {
    imageUrl: "/assets/games/hangman/hangman3.jpg",
    word: "TOUJOURS",
    hints: [
      "Une promesse dans le temps...",
      "Sans fin ni limite...",
      "Notre futur ensemble...",
      "À jamais...",
      "♾️",
    ],
  },
];

export default function PuzzlePage(): React.JSX.Element {
  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleStageComplete = () => {
    if (currentStage < gameStages.length - 1) {
      setTimeout(() => {
        setCurrentStage((prev) => prev + 1);
      }, 2000);
    } else {
      setIsComplete(true);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">
          Photo Mystère {currentStage + 1}/3 📸
        </h1>
        <p className="text-lg text-indigo-600 max-w-md mx-auto mb-8">
          Devine le mot caché pour révéler une photo spéciale ! Chaque lettre
          correcte rendra l&apos;image plus claire.
        </p>
      </motion.div>

      <PhotoMystery
        key={currentStage}
        onComplete={handleStageComplete}
        {...gameStages[currentStage]}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-8 space-y-4"
      >
        {isComplete ? (
          <p className="text-xl text-indigo-700 mb-4">
            Magnifique ! Tu as découvert toutes les photos ! 🎉
          </p>
        ) : (
          <button
            onClick={() => {
              if (currentStage < gameStages.length - 1) {
                setCurrentStage((prev) => prev + 1);
              } else {
                setIsComplete(true);
              }
            }}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Passer ce niveau →
          </button>
        )}
        {isComplete && (
          <Link
            href="/final-message"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Voir ta Surprise Finale →
          </Link>
        )}
      </motion.div>
    </main>
  );
}
