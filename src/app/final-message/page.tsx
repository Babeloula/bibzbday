"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Floating heart component
function FloatingHeart({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0.8],
        y: [0, -100],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
        times: [0, 0.2, 1],
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
      className="absolute text-3xl"
    >
      {["💖", "💝", "💗", "💓", "💕"][Math.floor(Math.random() * 5)]}
    </motion.div>
  );
}

export default function FinalMessagePage(): React.JSX.Element {
  const [showMessage, setShowMessage] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Start showing the message after a short delay
    const messageTimer = setTimeout(() => setShowMessage(true), 1000);
    // Start showing hearts after the message starts
    const heartsTimer = setTimeout(() => setShowHearts(true), 2000);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(heartsTimer);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert answer to lowercase and remove spaces for comparison
    const cleanAnswer = answer.toLowerCase().trim();
    // Replace this with your actual answer
    if (cleanAnswer === "together") {
      router.push("/final-message/key-location");
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Floating hearts background */}
      {showHearts && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: "0",
              }}
            >
              <FloatingHeart delay={i * 0.2} />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto text-center z-10">
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <motion.h1
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-purple-800 mb-6"
              >
                One Last Challenge! 🎯
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-6 text-lg text-purple-700"
              >
                <p className="text-xl font-medium">
                  Solve this riddle to find the key to your special box:
                </p>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                  <p className="italic text-xl text-purple-800">
                    &ldquo;Two hearts that beat as one,
                    <br />
                    Through storms and sunny days we run.
                    <br />
                    Like puzzle pieces perfectly aligned,
                    <br />
                    This word describes what fate designed.
                    <br />
                    Forever bound, in joy we stay,
                    <br />
                    Walking life&apos;s beautiful way.&rdquo;
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                      className={`w-64 px-4 py-2 text-lg rounded-lg border-2 
                        ${isError ? "border-red-300" : "border-purple-300"}
                        focus:outline-none focus:border-purple-500 transition-colors`}
                    />
                    <AnimatePresence>
                      {isError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-500"
                        >
                          That&apos;s not quite right. Try again! 💭
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                      Check Answer 🔍
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
