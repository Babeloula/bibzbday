"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PuzzlePage() {
  const [answer, setAnswer] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert answer to lowercase and remove spaces
    const cleanAnswer = answer.toLowerCase().trim();
    if (cleanAnswer === "1996") {
      router.push("/bravo");
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-8"
        >
          Une Petite Énigme...
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="relative w-full max-w-md mx-auto aspect-square mb-8">
            <Image
              src="/puzzle.jpg"
              alt="Puzzle"
              fill
              className="object-cover rounded-2xl shadow-lg"
              priority
            />
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100">
            <p className="text-xl text-purple-800 leading-relaxed">
              &ldquo;Je suis une année spéciale,
              <br />
              Où un grand événement s&apos;est passé,
              <br />
              Une petite fille est née,
              <br />
              Et depuis, elle n&apos;a cessé de briller.&rdquo;
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Entre ta réponse..."
                className={`w-72 px-6 py-3 text-lg rounded-xl border-2 
                  ${isError ? "border-red-300" : "border-purple-300"}
                  focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                  transition-all duration-200 bg-white/90 backdrop-blur-sm`}
              />
              <AnimatePresence>
                {isError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 font-medium"
                  >
                    Ce n&apos;est pas la bonne année... 🤔
                  </motion.p>
                )}
              </AnimatePresence>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-lg font-semibold 
                  shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200
                  hover:from-purple-600 hover:to-pink-600 active:scale-95"
              >
                Vérifier la Réponse 🔍
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
