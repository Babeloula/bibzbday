"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the Game component to avoid SSR issues
const PlatformerGame = dynamic(
  () => import("@/components/games/platformer/PlatformerGame"),
  { ssr: false }
);

export default function PlatformerPage() {
  const [isComplete, setIsComplete] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
          Collecteur de Souvenirs 🎮
        </h1>
        <p className="text-lg text-purple-600 max-w-md mx-auto mb-4">
          Saute et cours pour collecter nos précieux souvenirs !
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-600/90 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/30 w-full max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-3 text-center flex items-center justify-center gap-2">
            <span className="text-2xl">🎮</span> Comment Jouer
          </h2>
          <div className="flex flex-col gap-3">
            {/* Controls row */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-white text-purple-900 px-3 py-1.5 rounded-lg font-medium min-w-[80px] text-center">
                  ←/→
                </span>
                <span className="text-white">Se déplacer</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-purple-900 px-3 py-1.5 rounded-lg font-medium min-w-[80px] text-center">
                  ↑/ESPACE
                </span>
                <span className="text-white">Sauter</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-purple-900 px-3 py-1.5 rounded-lg font-medium min-w-[80px] text-center">
                  ↑/↓
                </span>
                <span className="text-white">Grimper</span>
              </div>
            </div>
            {/* Items row */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-white text-purple-900 px-3 py-1.5 rounded-lg font-medium min-w-[80px] text-center">
                  💎
                </span>
                <span className="text-white">Objets magiques</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-purple-900 px-3 py-1.5 rounded-lg font-medium min-w-[80px] text-center">
                  💝
                </span>
                <span className="text-white">Souvenirs d&apos;amour</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div
        id="game-container"
        className="w-full aspect-[2/1] max-w-[1920px] max-h-[960px] min-h-[160px] bg-gradient-to-b from-indigo-900 to-purple-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-300/20"
      >
        <PlatformerGame onComplete={() => setIsComplete(true)} />
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <p className="text-xl text-purple-700 mb-4">
            Tu as collecté tous nos moments spéciaux ! 🌟
          </p>
          <Link
            href="/games/word-scramble"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-lg font-semibold 
              shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200
              hover:from-purple-600 hover:to-pink-600 active:scale-95"
          >
            Continuer vers le Prochain Défi →
          </Link>
        </motion.div>
      )}
    </main>
  );
}
