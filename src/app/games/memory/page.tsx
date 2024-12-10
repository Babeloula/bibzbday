"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MemoryGame } from "@/components/games/memory/MemoryGame";

export default function MemoryGamePage() {
  const [isComplete, setIsComplete] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2">
          Memory Lane 💭
        </h1>
        <p className="text-lg text-purple-600 max-w-md mx-auto mb-8">
          Match the cards to reveal our special memories together!
        </p>
      </motion.div>

      <MemoryGame onComplete={() => setIsComplete(true)} />

      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <p className="text-xl text-purple-700 mb-4">
            Amazing! You've unlocked our precious memories! 🎉
          </p>
          <Link
            href="/games/platformer"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Continue to Next Adventure →
          </Link>
        </motion.div>
      )}
    </main>
  );
}
