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
      </motion.div>

      <div
        id="game-container"
        className="w-auto h-[80vh] bg-gradient-to-b from-indigo-900 to-purple-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-300/20"
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
