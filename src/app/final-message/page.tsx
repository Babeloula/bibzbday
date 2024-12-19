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
    // Convert answer to lowercase, remove spaces and special characters
    const cleanAnswer = answer
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "");
    if (cleanAnswer === "red pepper" || cleanAnswer === "redpepper") {
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
                className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-6"
              >
                Un Dernier Défi ! 🎯
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-6 text-lg text-purple-700"
              >
                <p className="text-xl font-medium">
                  Résous cette énigme pour trouver l&apos;emplacement de ta
                  surprise :
                </p>
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100">
                  <p className="italic text-xl text-purple-800 leading-relaxed">
                    &ldquo;On me trouve dans des recettes épicées,
                    <br />
                    Je porte la couleur de la passion,
                    <br />
                    Mon nom fait penser à un groupe qui fait vibrer les scènes,
                    <br />
                    Et sans moi, la harissa ne serait pas la même.&rdquo;
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
                          Ce n&apos;est pas tout à fait ça. Essaie encore ! 💭
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
