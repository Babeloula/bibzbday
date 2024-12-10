"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import SlidingPuzzle from "@/components/games/puzzle/SlidingPuzzle";

export default function PuzzlePage(): React.JSX.Element {
  const [isComplete, setIsComplete] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">
          Sliding Puzzle Challenge 🧩
        </h1>
        <p className="text-lg text-indigo-600 max-w-md mx-auto mb-8">
          Slide the pieces to complete the picture and reveal a special message!
        </p>
      </motion.div>

      <SlidingPuzzle onComplete={() => setIsComplete(true)} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-8 space-y-4"
      >
        {isComplete ? (
          <p className="text-xl text-indigo-700 mb-4">
            Amazing! You&apos;ve completed the puzzle! 🎉
          </p>
        ) : (
          <button
            onClick={() => setIsComplete(true)}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Skip Puzzle →
          </button>
        )}
        <Link
          href="/final-message"
          className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
        >
          {isComplete
            ? "See Your Final Surprise →"
            : "Continue to Final Surprise →"}
        </Link>
      </motion.div>
    </main>
  );
}
